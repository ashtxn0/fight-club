const toggleCheckbox = document.getElementById('checkbox');
let themeMode = localStorage.getItem("themeMode");

const setColorSchemePreference = (colorScheme) => {
    if (colorScheme === "dark") {
      document.documentElement.classList.add("dark");
      localStorage.setItem("themeMode", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("themeMode", "light");
    }
  };
  
  if (themeMode) {
    setColorSchemePreference(themeMode);
    toggleCheckbox.checked = themeMode === 'dark';
  } else {
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)').matches;
    toggleCheckbox.checked = prefersDarkScheme;
    if (prefersDarkScheme ? 'dark' : 'light'==="dark"){
      document.documentElement.classList.add("dark");
    }
  }

  if (darkEnabled === "dark") {
    toggleCheckbox.checked = true;
  }
  
  toggleCheckbox.addEventListener('change', () => {
    const newColorScheme = toggleCheckbox.checked ? 'dark' : 'light';
    setColorSchemePreference(newColorScheme);
  });
  
  
  