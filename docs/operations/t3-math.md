# Run T3 Math

Use Node 24 and the pnpm version specified in the root package.json. Install Vite+ as described
in the upstream development guide. Build only the server and browser client:

```sh
pnpm --filter t3... install --frozen-lockfile
pnpm exec vp run --filter t3 build
```

Run with a separate data directory and port. Never point this fork at the official app's
`~/.t3` data directory. The example uses loopback behind Tailscale Serve, which provides HTTPS
only to your tailnet:

```sh
node apps/server/dist/bin.mjs serve --base-dir "$HOME/.t3-math" \
  --host 127.0.0.1 --port 3774 --tailscale-serve --tailscale-serve-port 8443
```

Open the pairing link printed by the server in your browser. For another device, generate a
fresh one-time link against the same isolated instance:

```sh
node apps/server/dist/bin.mjs pair --base-dir "$HOME/.t3-math" \
  --tailscale --tailscale-serve-port 8443
```

Use Safari on iPhone to get math rendering. Connecting the official native iPhone app does not
change that app's renderer. Keep the host running and both devices connected to Tailscale.

Add the project folders you want to use in this instance. Conversation history is separate
from the official installation. Provider CLIs must be installed and authenticated on the host;
existing CLI authentication can be used without copying the official T3 database.

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
