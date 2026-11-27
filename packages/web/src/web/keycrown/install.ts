let deferred: (Event & { prompt: () => Promise<unknown> }) | undefined;
window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  deferred = event as typeof deferred;
});
export async function promptInstall(): Promise<boolean> {
  if (!deferred) return false;
  const request = deferred;
  deferred = undefined;
  try {
    await request.prompt();
    return true;
  } catch {
    return false;
  }
}
