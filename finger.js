// finger.js  – v1.1.0  (callback + promise dual API)
function finger(outputSelector = "#output") {

  const enc      = s => Uint8Array.from(s, c => c.charCodeAt(0));
  const toB64    = buf => btoa(String.fromCharCode(...new Uint8Array(buf)));
  const fromB64  = b64 => Uint8Array.from(atob(b64), c => c.charCodeAt(0));
  const show     = msg => { const el=document.querySelector(outputSelector); if(el) el.textContent=msg; };

  /* ─── REGISTER ─────────────────────────────────────────────── */
  async function doRegister(onDone) {
    const publicKey = {
      challenge: enc("register_challenge"),
      rp: { name: "Fingerprint Demo" },
      user: { id: enc("user-001"), name: "user@example.com", displayName: "User" },
      pubKeyCredParams: [{ type: "public-key", alg: -7 }],
      authenticatorSelection: { authenticatorAttachment: "platform", userVerification: "required" },
      timeout: 60000,
      attestation: "none"
    };

    try {
      const cred   = await navigator.credentials.create({ publicKey });
      const idB64  = toB64(cred.rawId);
      localStorage.setItem("finger_id", idB64);
      show("✅ Registered!\n\nID:\n" + idB64);
      console.log("Registered:", cred);
      onDone?.(idB64);
      return idB64;              // keeps Promise style working
    } catch (err) {
      show(" Registration error:\n" + err);
      console.error(err);
      onDone?.(false);
      return false;
    }
  }

  /* ─── LOGIN ────────────────────────────────────────────────── */
  async function doLogin(onDone) {
    const idB64 = localStorage.getItem("finger_id");
    if (!idB64) { show("No credential. Register first."); onDone?.(false); return false; }

    const publicKey = {
      challenge: enc("login_challenge"),
      timeout: 60000,
      userVerification: "required",
      allowCredentials: [{ id: fromB64(idB64), type: "public-key" }]
    };

    try {
      const assertion = await navigator.credentials.get({ publicKey });
      show("✅ Login OK!  See console.");
      console.log("Login:", assertion);
      onDone?.(true);
      return true;
    } catch (err) {
      show(" Login error:\n" + err);
      console.error(err);
      onDone?.(false);
      return false;
    }
  }

  /* public API */
  return {
    register: (cb) => doRegister(cb),
    login:    (cb) => doLogin(cb)
  };
}
