function finger(outputSelector = "#output") {
  const enc = str => Uint8Array.from(str, c => c.charCodeAt(0));
  const dec = str => Uint8Array.from(atob(str), c => c.charCodeAt(0));

  return {
    async register() {
      const publicKey = {
        challenge: enc("register_challenge"),
        rp: { name: "Fingerprint App" },
        user: {
          id: enc("user-001"),
          name: "user@example.com",
          displayName: "User",
        },
        pubKeyCredParams: [{ type: "public-key", alg: -7 }],
        authenticatorSelection: {
          authenticatorAttachment: "platform",
          userVerification: "required"
        },
        timeout: 60000,
        attestation: "none"
      };

      try {
        const cred = await navigator.credentials.create({ publicKey });
        const id = btoa(String.fromCharCode(...new Uint8Array(cred.rawId)));
        localStorage.setItem("finger_id", id);

        const el = document.querySelector(outputSelector);
        if (el) el.textContent = "✅ Registered\n\nID:\n" + id;
        console.log("Credential ID:", id);
      } catch (err) {
        console.error("Register error:", err);
      }
    },

    async login() {
      const storedId = localStorage.getItem("finger_id");
      if (!storedId) {
        alert("No credential found. Please register first.");
        return;
      }

      const publicKey = {
        challenge: enc("login_challenge"),
        timeout: 60000,
        userVerification: "required",
        allowCredentials: [{
          id: dec(storedId),
          type: "public-key",
        }]
      };

      try {
        const assertion = await navigator.credentials.get({ publicKey });
        const el = document.querySelector(outputSelector);
        if (el) el.textContent = "✅ Logged in\n\n" + JSON.stringify(assertion, null, 2);
        console.log("Login success:", assertion);
      } catch (err) {
        console.error("Login error:", err);
      }
    }
  };
}
