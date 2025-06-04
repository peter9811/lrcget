import { ref, computed } from 'vue'
import { invoke } from '@tauri-apps/api/core'

const isHotkeyState = ref(true)
const themeModeState = ref(true)
const lrclibInstanceState = ref('')
const romanizationStyleSimpleState = ref(false)

export function useGlobalState() {
  const disableHotkey = () => {
    console.log('disabled hotkey!')
    isHotkeyState.value = false
  }
  const enableHotkey = () => {
    console.log('enabled hotkey!')
    isHotkeyState.value = true
  }
  const isHotkey = computed(() => isHotkeyState.value)

  const setThemeMode = (mode) => {
    themeModeState.value = mode
  }
  const setLrclibInstance = (instance) => {
    lrclibInstanceState.value = instance
  }

  const setRomanizationStyleSimple = (value) => {
    romanizationStyleSimpleState.value = !!value; // Ensure boolean
  }

  const lrclibInstance = computed(() => lrclibInstanceState.value)

  const themeMode = computed(() => themeModeState.value)

  const romanizationStyleSimple = computed(() => romanizationStyleSimpleState.value)

  return {
    isHotkey,
    disableHotkey,
    enableHotkey,
    setThemeMode,
    themeMode,
    setLrclibInstance,
    lrclibInstance,
    setRomanizationStyleSimple,
    romanizationStyleSimple,
    initGlobalState,
  }
}

let initialized = false;
const initGlobalState = async () => {
  if (initialized) return;
  try {
    const config = await invoke('get_config');
    if (config) {
      if (typeof config.theme_mode === 'string') {
        // Assuming setThemeMode is available in this scope or via useGlobalState() if defined outside
        // For now, directly calling the setter that modifies themeModeState
        themeModeState.value = config.theme_mode;
      } else {
        themeModeState.value = 'auto';
      }
      if (typeof config.lrclib_instance === 'string') {
        lrclibInstanceState.value = config.lrclib_instance;
      } else {
        lrclibInstanceState.value = '';
      }
      if (typeof config.romanization_style_simple === 'boolean') {
        romanizationStyleSimpleState.value = config.romanization_style_simple;
      } else {
        romanizationStyleSimpleState.value = false; // Default if not found
      }
    }
  } catch (e) {
    console.error("Error initializing global state from config:", e);
    // Apply defaults for all settings in case of error
    themeModeState.value = 'auto';
    lrclibInstanceState.value = '';
    romanizationStyleSimpleState.value = false;
  }
  initialized = true;
};
