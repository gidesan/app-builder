const resourcesHookFactory = hook => (sources) => {
  const scriptsState = sources.map(source => hook(source));

  const everyScriptLoaded = scriptsState.every((state) => {
    const loaded = state[0];
    return loaded;
  });

  const someScriptError = scriptsState.some((state) => {
    const error = state[1];
    return error;
  });

  return [everyScriptLoaded, someScriptError];
};

export default resourcesHookFactory;
