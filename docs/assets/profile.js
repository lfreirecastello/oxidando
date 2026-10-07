(() => {
  "use strict";

  const STORAGE_KEY = "oxido-course-profile-v1";
  const allowed = {
    knowledge: ["basic", "intermediate", "advanced"],
    language: ["python", "java", "javascript"],
    rust: ["basic", "intermediate", "advanced"]
  };
  const defaults = { knowledge: "intermediate", language: "python", rust: "basic" };
  const labels = {
    basic: "Basic",
    intermediate: "Intermediate",
    advanced: "Advanced",
    python: "Python",
    java: "Java",
    javascript: "JavaScript"
  };

  const isAllowed = (key, value) => allowed[key].includes(value);

  const storedProfile = () => {
    try {
      const value = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (!value) return {};
      return Object.fromEntries(Object.keys(allowed)
        .filter((key) => isAllowed(key, value[key]))
        .map((key) => [key, value[key]]));
    } catch {
      return {};
    }
  };

  const currentProfile = () => {
    const params = new URLSearchParams(window.location.search);
    const stored = storedProfile();
    return Object.fromEntries(Object.keys(allowed).map((key) => {
      const requested = params.get(key);
      return [key, isAllowed(key, requested) ? requested : (stored[key] || defaults[key])];
    }));
  };

  const saveProfile = (profile) => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(profile)); } catch { /* URL still preserves the profile. */ }
  };

  const profileQuery = (profile) => new URLSearchParams(profile).toString();
  const profileTitle = (profile) => `${labels[profile.knowledge]} ${labels[profile.language]} → ${labels[profile.rust]} Rust`;

  const form = document.querySelector("#profile-form");
  if (form) {
    const initial = currentProfile();
    const setFormProfile = (profile) => {
      Object.entries(profile).forEach(([name, value]) => {
        const input = form.querySelector(`[name="${name}"][value="${value}"]`) || form.querySelector(`[name="${name}"]`);
        if (input) input.value = value;
        if (input?.type === "radio") input.checked = true;
      });
    };

    const readFormProfile = () => ({
      knowledge: new FormData(form).get("knowledge"),
      language: new FormData(form).get("language"),
      rust: new FormData(form).get("rust")
    });

    const updatePreview = () => {
      const profile = readFormProfile();
      document.querySelector("#path-summary").textContent = profileTitle(profile);
      document.querySelector("#pace-summary").textContent = {
        basic: "Extra explanations for general programming terms",
        intermediate: "Concise programming explanations",
        advanced: "Programming fundamentals kept brief"
      }[profile.knowledge];
      document.querySelector("#bridge-summary").textContent = `${labels[profile.language]} comparison code`;
      document.querySelector("#depth-summary").textContent = {
        basic: "Full Rust vocabulary and guided checkpoints",
        intermediate: "Faster pacing with API design context",
        advanced: "Systems details and optional deep dives"
      }[profile.rust];
    };

    setFormProfile(initial);
    updatePreview();
    form.addEventListener("change", updatePreview);
    form.addEventListener("submit", () => saveProfile(readFormProfile()));
    document.querySelector("#recommended-path")?.addEventListener("click", () => {
      const profile = readFormProfile();
      profile.rust = profile.knowledge === "advanced" ? "intermediate" : "basic";
      setFormProfile(profile);
      updatePreview();
    });
  }

  const course = document.querySelector("[data-course-page]");
  if (!course) return;

  const profile = currentProfile();
  saveProfile(profile);
  course.dataset.knowledgeLevel = profile.knowledge;
  course.dataset.bridgeLanguage = profile.language;
  course.dataset.rustLevel = profile.rust;

  const query = profileQuery(profile);
  const bridgeName = labels[profile.language];
  document.title = `Óxido — ${bridgeName} to Rust`;
  document.querySelector("#course-language-label").textContent = `${bridgeName} → Rust`;
  document.querySelector("#hero-language").textContent = bridgeName;
  document.querySelector("#active-path").textContent = profileTitle(profile);
  document.querySelector("#adjust-path").href = `../?${query}`;
  document.querySelector("#depth-copy").textContent = {
    basic: "Guided path: every Rust keyword is introduced before use, with full checkpoints.",
    intermediate: "Accelerated path: syntax stays concise while API and ownership reasoning expand.",
    advanced: "Deep path: fundamentals stay available while systems implications take priority."
  }[profile.rust];

  const bridges = {
    python: {
      orientation: "Rust uses a few symbols that Python usually hides. Learn these first; the rest of the module will stop looking mysterious.",
      stringsCopy: "Python has one everyday string type. Rust separates owned, growable String from a borrowed text view, &str.",
      vectorsCopy: "A vector resembles a Python list, but every element has the same type. The vec! macro creates one conveniently.",
      glossary: {
        function: "def",
        binding: "Assignment creates a name",
        print: "print()",
        semicolon: "Usually a newline",
        block: "Indentation creates a block"
      },
      variableMeta: "mutable by default",
      variables: "count = 10\ncount += 1\nprint(count)",
      vectors: "scores = [10, 20]\nscores.append(30)\nfirst = scores[0]\nlast = scores.pop()",
      functions: "def add_tax(price: float, rate: float) -> float:\n    return price * (1.0 + rate)",
      ownership: "first = [\"Acme\"]\nsecond = first\nsecond.append(\"ready\")\nprint(first)"
    },
    javascript: {
      orientation: "Rust shares some punctuation with JavaScript, but often gives it stricter meaning. This guide highlights those differences first.",
      stringsCopy: "JavaScript has primitive strings with automatic memory management. Rust separates owned, growable String from a borrowed text view, &str.",
      vectorsCopy: "A vector resembles a JavaScript array, but every element has the same type. The vec! macro creates one conveniently.",
      glossary: {
        function: "function or an arrow function",
        binding: "let creates a reassignable binding",
        print: "console.log()",
        semicolon: "Often ends a statement",
        block: "Braces create a block"
      },
      variableMeta: "let permits reassignment",
      variables: "let count = 10;\ncount += 1;\nconsole.log(count);",
      vectors: "const scores = [10, 20];\nscores.push(30);\nconst first = scores[0];\nconst last = scores.pop();",
      functions: "function addTax(price, rate) {\n  return price * (1 + rate);\n}",
      ownership: "const first = [\"Acme\"];\nconst second = first;\nsecond.push(\"ready\");\nconsole.log(first);"
    },
    java: {
      orientation: "Rust looks familiar beside Java, but functions can exist outside classes and ownership replaces garbage-collected references. Start with these syntax bridges.",
      stringsCopy: "Java String values are immutable objects managed by the garbage collector. Rust separates owned, growable String from a borrowed text view, &str.",
      vectorsCopy: "A vector resembles Java's ArrayList<T>, with contiguous storage and explicit ownership. The vec! macro creates one conveniently.",
      glossary: {
        function: "A typed method, without requiring a class",
        binding: "A typed local declaration or var",
        print: "System.out.println()",
        semicolon: "Ends a statement",
        block: "Braces create a block"
      },
      variableMeta: "variables may be reassigned",
      variables: "int count = 10;\ncount += 1;\nSystem.out.println(count);",
      vectors: "var scores = new ArrayList<Integer>();\nscores.add(10);\nscores.add(20);\nvar first = scores.get(0);",
      functions: "static double addTax(double price, double rate) {\n    return price * (1.0 + rate);\n}",
      ownership: "var first = new ArrayList<String>();\nfirst.add(\"Acme\");\nvar second = first;\nsecond.add(\"ready\");"
    }
  };
  const bridge = bridges[profile.language];

  document.querySelectorAll("[data-bridge-name]").forEach((node) => { node.textContent = bridgeName; });
  document.querySelector("#orientation-bridge-copy").textContent = bridge.orientation;
  document.querySelector("#bridge-column-heading").textContent = `${bridgeName} bridge`;
  document.querySelectorAll("[data-bridge-glossary]").forEach((node) => {
    node.setAttribute("data-label", bridgeName);
    node.textContent = bridge.glossary[node.dataset.bridgeGlossary];
  });
  document.querySelector("#strings-bridge-copy").textContent = bridge.stringsCopy;
  document.querySelector("#vectors-bridge-copy").textContent = bridge.vectorsCopy;
  document.querySelector("#variables-bridge-meta").textContent = bridge.variableMeta;
  document.querySelector("#variables-bridge-code").textContent = bridge.variables;
  document.querySelector("#vectors-bridge-code").textContent = bridge.vectors;
  document.querySelector("#functions-bridge-code").textContent = bridge.functions;
  document.querySelector("#ownership-bridge-code").textContent = bridge.ownership;
})();
