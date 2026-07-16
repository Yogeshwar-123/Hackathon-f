import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Sparkles, ArrowRight, Lock, Mail, User, Building, Loader, Phone, Github, Smartphone, Globe } from "lucide-react";
import { auth } from "../googleDrive";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
  RecaptchaVerifier,
  signInWithPhoneNumber
} from "firebase/auth";

const isFirebaseAuthFallbackError = ( error ) => {
  const code = error?.code || "";
  const message = error?.message || "";
  const loweredMessage = message.toLowerCase();

  return [
    "auth/unauthorized-domain",
    "auth/network-request-failed",
    "auth/configuration-not-found",
    "auth/operation-not-allowed",
    "auth/invalid-api-key",
    "auth/app-not-authorized",
    "auth/invalid-app-credential",
    "auth/internal-error"
  ].includes( code ) || loweredMessage.includes( "authorized domain" ) || loweredMessage.includes( "domain" ) || loweredMessage.includes( "configuration" ) || loweredMessage.includes( "api key" ) || loweredMessage.includes( "popup closed" );
};

export default function Auth( { onLoginSuccess, user } ) {
  const navigate = useNavigate();
  const [ searchParams ] = useSearchParams();
  const initialMode = searchParams.get( "mode" ) === "register" ? "register" : "login";
  const [ mode, setMode ] = useState( "login" );
  const [ loading, setLoading ] = useState( false );
  const [ error, setError ] = useState( "" );
  const [ email, setEmail ] = useState( "" );
  const [ password, setPassword ] = useState( "" );
  const [ name, setName ] = useState( "" );
  const [ businessName, setBusinessName ] = useState( "" );
  const [ businessType, setBusinessType ] = useState( "Wholesale & Distribution" );
  const [ currency, setCurrency ] = useState( "USD" );
  const [ phoneNumber, setPhoneNumber ] = useState( "" );
  const [ otpCode, setOtpCode ] = useState( "" );
  const [ otpSent, setOtpSent ] = useState( false );
  const [ confirmationResult, setConfirmationResult ] = useState( null );
  const [ isPhoneMode, setIsPhoneMode ] = useState( false );
  useEffect( () => {
    setMode( initialMode );
  }, [ initialMode ] );
  useEffect( () => {
    if ( user ) {
      navigate( "/dashboard" );
    }
  }, [ user, navigate ] );
  const handleSubmit = async ( e ) => {
    e.preventDefault();
    setError( "" );
    setLoading( true );

    const cleanEmail = email.toLowerCase().trim();

    if ( mode === "login" ) {
      if ( !cleanEmail || !password ) {
        setError( "Please fill out all credential fields." );
        setLoading( false );
        return;
      }
      try {
        // Step 1: Authenticate with Firebase Auth (Gracefully bypass Firebase config/network errors)
        let firebaseUser = null;
        try {
          const userCredential = await signInWithEmailAndPassword( auth, cleanEmail, password );
          firebaseUser = userCredential.user;
        } catch ( fbErr ) {
          console.warn( "Firebase Auth sign-in failed, checking server-side fallback...", fbErr );
          if ( fbErr.code === "auth/wrong-password" ) {
            throw fbErr;
          }

          if ( isFirebaseAuthFallbackError( fbErr ) ) {
            console.warn( "Firebase Auth is unavailable for this domain; continuing with backend fallback.", fbErr );
          } else if ( fbErr.code === "auth/user-not-found" || fbErr.code === "auth/invalid-credential" || fbErr.code === "auth/invalid-email" ) {
            try {
              const userCredential = await createUserWithEmailAndPassword( auth, cleanEmail, password );
              firebaseUser = userCredential.user;
            } catch ( createErr ) {
              console.warn( "Auto-registration on Firebase failed:", createErr );
            }
          }
        }

        // Step 2: Sync session and load database with backend Express server
        const res = await fetch( "/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify( { email: cleanEmail, password, name: "", businessName: "", businessType: "Solar Energy Systems & Green Technology", currency: "INR" } )
        } );
        const data = await res.json();
        if ( !res.ok ) {
          throw new Error( data.error || "Backend synchronization failed" );
        }

        // Step 3: Success
        localStorage.setItem( "bizpilot_profile", JSON.stringify( data.profile ) );
        onLoginSuccess( data.profile );
        navigate( "/dashboard" );
      } catch ( err ) {
        console.error( "Login failure:", err );
        let msg = "Authentication failed.";
        if ( err.code === "auth/wrong-password" || err.message === "Incorrect password for this registered account." ) {
          msg = "Incorrect password for this email.";
        } else if ( err.code === "auth/invalid-email" ) {
          msg = "Invalid email address format.";
        } else if ( err.code === "auth/weak-password" ) {
          msg = "Password should be at least 6 characters.";
        } else {
          msg = err.message || msg;
        }
        setError( msg );
      } finally {
        setLoading( false );
      }
    } else {
      if ( !name || !cleanEmail || !password || !businessName ) {
        setError( "All credentials and business details are required." );
        setLoading( false );
        return;
      }
      try {
        // Step 1: Create user on Firebase Auth (Gracefully handle config/operation errors)
        try {
          await createUserWithEmailAndPassword( auth, cleanEmail, password );
        } catch ( fbErr ) {
          if ( !isFirebaseAuthFallbackError( fbErr ) ) {
            console.warn( "Firebase Auth registration failed, relying on server-side registration fallback...", fbErr );
          }
        }

        // Step 2: Register details on Express backend
        const payload = {
          name,
          email: cleanEmail,
          password,
          businessName,
          businessType,
          currency
        };
        const res = await fetch( "/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify( payload )
        } );
        const data = await res.json();
        if ( !res.ok ) {
          throw new Error( data.error || "Backend registration failed." );
        }

        // Step 3: Success
        localStorage.setItem( "bizpilot_profile", JSON.stringify( data.profile ) );
        onLoginSuccess( data.profile );
        navigate( "/dashboard" );
      } catch ( err ) {
        console.error( "Registration error:", err );
        let msg = "Failed to create account.";
        if ( err.code === "auth/email-already-in-use" ) {
          msg = "This email is already registered.";
        } else if ( err.code === "auth/invalid-email" ) {
          msg = "Invalid email format.";
        } else if ( err.code === "auth/weak-password" ) {
          msg = "Password must be at least 6 characters.";
        } else {
          msg = err.message || msg;
        }
        setError( msg );
      } finally {
        setLoading( false );
      }
    }
  };

  const handleGoogleSignIn = async () => {
    setError( "" );
    setLoading( true );
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters( { prompt: "select_account" } );
      const result = await signInWithPopup( auth, provider );
      const user = result.user;

      const cleanEmail = user.email ? user.email.toLowerCase().trim() : `${ user.uid }@google.local`;
      const password = user.uid;

      const res = await fetch( "/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify( {
          email: cleanEmail,
          password: password,
          name: user.displayName || cleanEmail.split( "@" )[ 0 ],
          businessName: user.displayName ? `${ user.displayName }'s Solar Co` : `${ cleanEmail.split( "@" )[ 0 ] }'s Solar Co`,
          businessType: "Solar Energy Systems & Green Technology",
          currency: "INR"
        } )
      } );
      const data = await res.json();
      if ( !res.ok ) {
        throw new Error( data.error || "Backend synchronization failed" );
      }

      localStorage.setItem( "bizpilot_profile", JSON.stringify( data.profile ) );
      onLoginSuccess( data.profile );
      navigate( "/dashboard" );
    } catch ( err ) {
      console.error( "Google Sign-In Error:", err );
      setError( err.message || "Failed to sign in with Google." );
    } finally {
      setLoading( false );
    }
  };

  const handleGithubSignIn = async () => {
    setError( "" );
    setLoading( true );
    try {
      const provider = new GithubAuthProvider();
      const result = await signInWithPopup( auth, provider );
      const user = result.user;

      const cleanEmail = user.email ? user.email.toLowerCase().trim() : `${ user.uid }@github.local`;
      const password = user.uid;

      const res = await fetch( "/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify( {
          email: cleanEmail,
          password: password,
          name: user.displayName || user.reloadUserInfo?.screenName || cleanEmail.split( "@" )[ 0 ],
          businessName: user.displayName ? `${ user.displayName }'s Solar Co` : `${ cleanEmail.split( "@" )[ 0 ] }'s Solar Co`,
          businessType: "Solar Energy Systems & Green Technology",
          currency: "INR"
        } )
      } );
      const data = await res.json();
      if ( !res.ok ) {
        throw new Error( data.error || "Backend synchronization failed" );
      }

      localStorage.setItem( "bizpilot_profile", JSON.stringify( data.profile ) );
      onLoginSuccess( data.profile );
      navigate( "/dashboard" );
    } catch ( err ) {
      console.error( "GitHub Sign-In Error:", err );
      setError( err.message || "Failed to sign in with GitHub." );
    } finally {
      setLoading( false );
    }
  };

  const handleSendOtp = async ( e ) => {
    e.preventDefault();
    setError( "" );
    setLoading( true );
    try {
      const formattedPhone = phoneNumber.trim();
      if ( !formattedPhone.startsWith( "+" ) ) {
        throw new Error( "Phone number must start with '+' and include country code, e.g. +919876543210" );
      }

      if ( !window.recaptchaVerifier ) {
        window.recaptchaVerifier = new RecaptchaVerifier( auth, "recaptcha-container", {
          size: "invisible",
        } );
      }

      const appVerifier = window.recaptchaVerifier;
      const confirmation = await signInWithPhoneNumber( auth, formattedPhone, appVerifier );
      setConfirmationResult( confirmation );
      setOtpSent( true );
    } catch ( err ) {
      console.error( "OTP send error:", err );
      setError( err.message || "Failed to send verification code. Check number format." );
      if ( window.recaptchaVerifier ) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    } finally {
      setLoading( false );
    }
  };

  const handleVerifyOtp = async ( e ) => {
    e.preventDefault();
    setError( "" );
    setLoading( true );
    try {
      if ( !otpCode ) {
        throw new Error( "Please enter the 6-digit OTP code." );
      }
      const result = await confirmationResult.confirm( otpCode );
      const user = result.user;

      const cleanEmail = `${ user.phoneNumber }@phone.local`;
      const password = user.uid;

      const res = await fetch( "/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify( {
          email: cleanEmail,
          password: password,
          name: user.phoneNumber,
          businessName: `${ user.phoneNumber }'s Solar Co`,
          businessType: "Solar Energy Systems & Green Technology",
          currency: "INR"
        } )
      } );
      const data = await res.json();
      if ( !res.ok ) {
        throw new Error( data.error || "Backend synchronization failed" );
      }

      localStorage.setItem( "bizpilot_profile", JSON.stringify( data.profile ) );
      onLoginSuccess( data.profile );
      navigate( "/dashboard" );
    } catch ( err ) {
      console.error( "OTP verification error:", err );
      setError( err.message || "Invalid verification code." );
    } finally {
      setLoading( false );
    }
  };

  const handleDemoLogin = async () => {
    setLoading( true );
    setError( "" );
    const demoEmail = "gamigrrider18@gmail.com";
    const demoPassword = "demo12345"; // at least 6 characters for Firebase Auth

    try {
      // Step 1: Authenticate with Firebase
      let firebaseUser;
      try {
        const userCredential = await signInWithEmailAndPassword( auth, demoEmail, demoPassword );
        firebaseUser = userCredential.user;
      } catch ( fbErr ) {
        if ( isFirebaseAuthFallbackError( fbErr ) ) {
          console.warn( "Firebase Auth is unavailable for demo login; using backend fallback.", fbErr );
        } else if ( fbErr.code === "auth/user-not-found" || fbErr.code === "auth/invalid-credential" ) {
          try {
            const userCredential = await createUserWithEmailAndPassword( auth, demoEmail, demoPassword );
            firebaseUser = userCredential.user;
          } catch ( createErr ) {
            throw fbErr;
          }
        } else {
          throw fbErr;
        }
      }

      // Step 2: Sync with backend
      const res = await fetch( "/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify( {
          email: demoEmail,
          password: demoPassword
        } )
      } );
      const data = await res.json();
      if ( !res.ok ) {
        throw new Error( data.error || "Demo backend sync failed" );
      }

      localStorage.setItem( "bizpilot_profile", JSON.stringify( data.profile ) );
      onLoginSuccess( data.profile );
      navigate( "/dashboard" );
    } catch ( err ) {
      console.error( "Demo login fail, fallback:", err );
      const demoUser = {
        name: "Siddu",
        email: demoEmail,
        businessName: "Gamig Solar Solutions",
        businessType: "Solar Energy Systems & Green Technology",
        currency: "INR"
      };
      localStorage.setItem( "bizpilot_profile", JSON.stringify( demoUser ) );
      onLoginSuccess( demoUser );
      navigate( "/dashboard" );
    } finally {
      setLoading( false );
    }
  };
  return <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-6 relative overflow-hidden font-sans">

    {
      /* Glow Effects */
    }
    <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
    <div className="absolute bottom-10 left-10 w-[300px] h-[300px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

    {
      /* Brand Header */
    }
    <div className="flex items-center gap-3 mb-8 cursor-pointer z-10" onClick={() => navigate( "/" )}>
      <div className="bg-gradient-to-tr from-indigo-600 to-blue-500 p-2 rounded-xl">
        <Sparkles className="w-5 h-5 text-white" />
      </div>
      <span className="font-display font-bold text-2xl tracking-tight">BIzPilot</span>
    </div>

    {
      /* Main Auth Container */
    }
    <div className="w-full max-w-lg bg-slate-900/40 border border-slate-800/80 backdrop-blur-xl p-8 rounded-3xl z-10 shadow-2xl relative">
      <div className="absolute top-0 left-10 right-10 h-[1px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />

      {
        /* Toggle Mode Tab */
      }
      <div className="flex border-b border-slate-800 mb-8">
        <button
          onClick={() => setMode( "login" )}
          className={`flex-1 pb-3 text-sm font-semibold transition-all ${ mode === "login" ? "text-indigo-400 border-b-2 border-indigo-500" : "text-slate-400 hover:text-slate-300" }`}
        >
          Sign In
        </button>
        <button
          onClick={() => setMode( "register" )}
          className={`flex-1 pb-3 text-sm font-semibold transition-all ${ mode === "register" ? "text-indigo-400 border-b-2 border-indigo-500" : "text-slate-400 hover:text-slate-300" }`}
        >
          Create Account
        </button>
      </div>

      <h2 className="text-xl font-display font-bold mb-2">
        {mode === "login" ? "Welcome back, Operator" : "Configure Your Profile"}
      </h2>
      <p className="text-slate-400 text-xs mb-6">
        {mode === "login" ? "Enter your credentials to manage your Business Command Center." : "Set up your business parameters and profile details."}
      </p>

      {error && <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl mb-6">
        {error}
      </div>}

      {/* Alternate Social & Mobile Sign-In Providers */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="flex items-center justify-center gap-1.5 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300 font-semibold py-2.5 px-2 rounded-xl transition-all text-xs cursor-pointer focus:outline-none"
          title="Sign in with Google"
        >
          <Globe className="w-3.5 h-3.5 text-blue-400 shrink-0" />
          <span>Google</span>
        </button>

        <button
          type="button"
          onClick={handleGithubSignIn}
          disabled={loading}
          className="flex items-center justify-center gap-1.5 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300 font-semibold py-2.5 px-2 rounded-xl transition-all text-xs cursor-pointer focus:outline-none"
          title="Sign in with GitHub"
        >
          <Github className="w-3.5 h-3.5 text-slate-100 shrink-0" />
          <span>GitHub</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setIsPhoneMode( !isPhoneMode );
            setError( "" );
          }}
          disabled={loading}
          className={`flex items-center justify-center gap-1.5 border font-semibold py-2.5 px-2 rounded-xl transition-all text-xs cursor-pointer focus:outline-none ${ isPhoneMode
            ? "bg-indigo-600/20 border-indigo-500 text-indigo-300"
            : "bg-slate-950 hover:bg-slate-900 border-slate-800 text-slate-300"
            }`}
          title="Sign in with Mobile Phone OTP"
        >
          <Phone className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
          <span>Mobile</span>
        </button>
      </div>

      {/* Divider text if not phone mode */}
      {!isPhoneMode && (
        <div className="relative my-5 text-center">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-800" /></div>
          <span className="relative bg-[#0f172a] px-3.5 text-[9px] font-bold text-slate-500 uppercase tracking-widest">or use secure credentials</span>
        </div>
      )}

      {isPhoneMode ? (
        <div className="space-y-4">
          <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs rounded-xl mb-2 flex items-center gap-2">
            <Phone className="w-4 h-4 shrink-0 text-indigo-400" />
            <span>We'll send a 6-digit OTP code to verify your identity.</span>
          </div>

          {!otpSent ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1.5">Mobile Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +919876543210"
                    value={phoneNumber}
                    onChange={( e ) => setPhoneNumber( e.target.value )}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-11 pr-4 text-xs focus:border-indigo-500 focus:outline-none transition-colors text-slate-200"
                  />
                </div>
              </div>

              {/* Recaptcha Container */}
              <div id="recaptcha-container" className="my-2 flex justify-center"></div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-indigo-600/20 text-xs flex items-center justify-center gap-2 cursor-pointer mt-4"
              >
                {loading ? (
                  <>
                    <Loader className="w-3.5 h-3.5 animate-spin" />
                    <span>Sending verification...</span>
                  </>
                ) : (
                  <>
                    <span>Send Verification Code</span>
                    <ArrowRight className="w-4.5 h-4.5" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1.5">Enter 6-Digit OTP Code</label>
                <div className="relative">
                  <Smartphone className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="e.g. 123456"
                    value={otpCode}
                    onChange={( e ) => setOtpCode( e.target.value )}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-11 pr-4 text-xs focus:border-indigo-500 focus:outline-none transition-colors text-slate-200 text-center tracking-widest font-mono text-lg"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setOtpSent( false );
                    setOtpCode( "" );
                  }}
                  className="text-indigo-400 hover:underline cursor-pointer"
                >
                  Change phone number
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-emerald-600/20 text-xs flex items-center justify-center gap-2 cursor-pointer mt-4"
              >
                {loading ? (
                  <>
                    <Loader className="w-3.5 h-3.5 animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <span>Verify OTP & Sign In</span>
                    <ArrowRight className="w-4.5 h-4.5" />
                  </>
                )}
              </button>
            </form>
          )}

          <button
            type="button"
            onClick={() => {
              setIsPhoneMode( false );
              setError( "" );
            }}
            className="w-full text-center text-slate-400 hover:text-slate-300 text-xs pt-2 font-semibold"
          >
            ← Back to Email Sign In
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" && <>
            {
              /* Profile Name */
            }
            <div>
              <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1.5">Your Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Mercer"
                  value={name}
                  onChange={( e ) => setName( e.target.value )}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-11 pr-4 text-xs focus:border-indigo-500 focus:outline-none transition-colors text-slate-200"
                />
              </div>
            </div>

            {
              /* Business Name */
            }
            <div>
              <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1.5">Business / Enterprise Name</label>
              <div className="relative">
                <Building className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Brewmaster Wholesale Supplies"
                  value={businessName}
                  onChange={( e ) => setBusinessName( e.target.value )}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-11 pr-4 text-xs focus:border-indigo-500 focus:outline-none transition-colors text-slate-200"
                />
              </div>
            </div>

            {
              /* Business Type & Currency */
            }
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1.5">Enterprise Type</label>
                <select
                  value={businessType}
                  onChange={( e ) => setBusinessType( e.target.value )}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3.5 text-xs focus:border-indigo-500 focus:outline-none transition-colors text-slate-300"
                >
                  <option value="Wholesale & Distribution">Wholesale & Dist.</option>
                  <option value="Retail Boutique">Retail Boutique</option>
                  <option value="Local Manufacturing">Manufacturing</option>
                  <option value="Small Startup">Tech Startup</option>
                  <option value="Services & Consulting">Services</option>
                  <option value="Healthcare & Pharmacy">Healthcare / Pharmacy</option>
                  <option value="Logistics & Transport">Logistics / Transport</option>
                  <option value="Construction & Materials">Construction / Materials</option>
                  <option value="Restaurant & Food Service">Restaurant / Food Service</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1.5">Currency Code</label>
                <select
                  value={currency}
                  onChange={( e ) => setCurrency( e.target.value )}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3.5 text-xs focus:border-indigo-500 focus:outline-none transition-colors text-slate-300"
                >
                  <option value="INR">INR (₹)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="JPY">JPY (¥)</option>
                  <option value="AUD">AUD ($)</option>
                </select>
              </div>
            </div>
          </>}

          {
            /* Email Address */
          }
          <div>
            <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
              <input
                type="email"
                required
                placeholder="e.g. alex@brewmaster.com"
                value={email}
                onChange={( e ) => setEmail( e.target.value )}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-11 pr-4 text-xs focus:border-indigo-500 focus:outline-none transition-colors text-slate-200"
              />
            </div>
          </div>

          {
            /* Password */
          }
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400">Security Password</label>
              {mode === "login" && <span className="text-[10px] text-indigo-400 hover:underline cursor-pointer">Forgot?</span>}
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
              <input
                type="password"
                required
                placeholder="Enter password"
                value={password}
                onChange={( e ) => setPassword( e.target.value )}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-11 pr-4 text-xs focus:border-indigo-500 focus:outline-none transition-colors text-slate-200"
              />
            </div>
          </div>

          {
            /* Submit Button */
          }
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-indigo-600/20 text-xs flex items-center justify-center gap-2 cursor-pointer mt-6"
          >
            {loading ? <>
              <Loader className="w-3.5 h-3.5 animate-spin" />
              <span>Processing Pilot Sync...</span>
            </> : <>
              <span>{mode === "login" ? "Enter Sandbox Command Center" : "Launch AI Business Pilot"}</span>
              <ArrowRight className="w-4.5 h-4.5" />
            </>}
          </button>
        </form>
      )}

      <div className="relative my-6 text-center">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-800" /></div>
        <span className="relative bg-[#0f172a] px-3.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">or demo instant access</span>
      </div>

      {
        /* Demo Shortcut Sandbox */
      }
      <button
        onClick={handleDemoLogin}
        disabled={loading}
        className="w-full bg-slate-950 hover:bg-slate-900 border border-slate-800 text-indigo-300 font-bold py-2.5 rounded-xl transition-all text-xs flex items-center justify-center gap-2 cursor-pointer"
      >
        <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
        <span>Launch Immediate High-Fidelity Sandbox</span>
      </button>
    </div>
  </div>;
}
