# Run T3 Math

Host one instance on a Linux server and use it from a browser on Mac, Windows, or iPhone.
These instructions build this fork's `math-web` branch; no native app build is required.

## Prerequisites

- Git, Node **24.13.1 or later within Node 24**, and pnpm **11.10.0** (see root `package.json`).
- [Vite+](../../README.md#install-vp) installed on the host.
- An installed, authenticated provider CLI on the host, such as Codex or Claude Code.
- Tailscale running on the host and each device, connected to the same tailnet with access
  to the host. Enable [HTTPS certificates](https://tailscale.com/docs/how-to/set-up-https-certificates)
  for [Tailscale Serve](https://tailscale.com/docs/features/tailscale-serve).

Run the server as the user who authenticated the provider CLI. That user also needs permission
to configure Tailscale Serve. On Linux, an administrator can grant this with
`sudo tailscale set --operator="$(id -un)"`, run from that user's shell.

## Clone and build

```sh
git clone --branch math-web --single-branch https://github.com/nvasilevv/t3-math.git
cd t3-math
pnpm --filter 't3...' --filter '@t3tools/scripts...' \
  --filter @t3tools/oxlint-plugin-t3code install --frozen-lockfile
T3CODE_WEB_SOURCEMAP=0 pnpm exec vp run --filter t3 build
```

This builds the server and browser client. Allow several GB of free RAM and disk space.

## Start and pair over Tailscale

Run with a separate data directory and port. Never point this fork at the official app's
`~/.t3` data directory. The example uses loopback behind Tailscale Serve, which provides HTTPS
only to your tailnet:

```sh
node apps/server/dist/bin.mjs serve --base-dir "$HOME/.t3-math" \
  --host 127.0.0.1 --port 3774 --tailscale-serve --tailscale-serve-port 8443
```

Open the pairing link printed by the server in your browser. For another device, generate a
fresh one-time link in a second terminal, from the checkout directory:

```sh
node apps/server/dist/bin.mjs pair --base-dir "$HOME/.t3-math" \
  --tailscale --tailscale-serve-port 8443 --ttl 15m --label "My phone"
```

Open the generated link on the device you want to pair, or paste its token into the pairing
screen and select **Continue**. Each token can be used once and this example expires after
15 minutes; run the command again for another browser or an expired token. Keep pairing links
private. Share this repository with the community, not your server's pairing credentials.

After pairing, bookmark `https://YOUR-HOST.YOUR-TAILNET.ts.net:8443` using the actual hostname
from the printed link. HTTPS is provided by Tailscale Serve and is reachable within your
tailnet. Choose an unused Serve port if 8443 is already occupied; use the same port in both commands.

Use Safari on iPhone to get math rendering. Connecting the official native iPhone app does not
change that app's renderer. Keep the host running and both devices connected to Tailscale.

Add the project folders you want to use in this instance. Conversation history is separate
from the official installation. Provider CLIs must be installed and authenticated on the host;
existing CLI authentication can be used without copying the official T3 database.

If math is disabled in an existing browser, enable **Settings → Appearance → Render math**.
Try asking for `$$x = \frac{-b \pm \sqrt{b^2-4ac}}{2a}$$` to check rendering.

If the page will not open, check `tailscale status` on the host and the device's Tailscale
connection. If startup reports a Serve or certificate error, check the host user's Serve
permissions and the tailnet's HTTPS settings. The terminal running the server must stay open
until you install a persistent service.

## Keep it running

Use a dedicated service named `t3-math`, with the checkout as its working directory, an absolute
path to Node 24, and the `serve` command above. Include the directories containing your provider
CLIs in its PATH. Keep service logs private because startup output can contain pairing links.

## Updates

This is a source deployment. Do not use `t3 update` or the upstream install script to update it.
Update the fork's `math-web` branch, install its locked dependencies, run focused math tests,
rebuild, and restart only `t3-math`. Back up this instance's database before taking upstream
changes that may migrate it. Retain a known-good commit/build for rollback.

Only merge upstream changes deliberately; this keeps the math patch and separate browser branding
reviewable. Never copy a newer database over the official installation to move conversations back.
