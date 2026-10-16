// CommonJS es necesario para precargar la guardia con node --require antes de tsx.
/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require("node:assert/strict");
const childProcess = require("node:child_process");
const { syncBuiltinESMExports } = require("node:module");
const net = require("node:net");
const path = require("node:path");
/* eslint-enable @typescript-eslint/no-require-imports */

if (process.env.EPIS_DRY_RUN_GUARD === "1") {
  let processAttempts = 0;
  let connectionAttempts = 0;
  // tsx puede iniciar su compilador esbuild; ningún otro proceso está permitido.
  for (const method of ["spawn", "spawnSync", "execFile", "execFileSync", "exec", "execSync", "fork"]) {
    const original = childProcess[method];
    childProcess[method] = function (file, ...args) {
      if (typeof file === "string" && /(?:^|[/\\])esbuild(?:\.exe)?$/.test(file)) {
        return original.call(this, file, ...args);
      }
      processAttempts++;
      throw new Error("--dry-run intentó iniciar un proceso externo (incluido Python).");
    };
  }
  const originalConnect = net.Socket.prototype.connect;
  net.Socket.prototype.connect = function (...args) {
    const options = Array.isArray(args[0]) ? args[0][0] : args[0];
    const pipe = typeof options === "string" ? options : options?.path;
    // tsx intenta contactar a su padre por un named pipe local, sin TCP.
    if (typeof pipe === "string" && /[/\\]tsx-[^/\\]+[/\\]\d+\.pipe$/.test(pipe)) {
      return originalConnect.apply(this, args);
    }
    connectionAttempts++;
    throw new Error("--dry-run intentó abrir una conexión de red (incluido PostgreSQL).");
  };
  syncBuiltinESMExports();
  process.on("exit", () => {
    if (processAttempts || connectionAttempts) process.exitCode = 1;
    console.log(`Guardia: ${processAttempts} procesos externos, ${connectionAttempts} conexiones.`);
  });
} else {
  // No cargar .env.local: esta prueba no necesita ni lee credenciales.
  const result = childProcess.spawnSync(process.execPath, [
    "--require", __filename,
    "--import", "tsx",
    path.join(__dirname, "ingest.ts"),
    "--dry-run",
  ], {
    cwd: path.join(__dirname, ".."),
    encoding: "utf8",
    timeout: 30_000,
    windowsHide: true,
    env: {
      NODE_ENV: "test",
      EPIS_DRY_RUN_GUARD: "1",
      SystemRoot: process.env.SystemRoot,
      WINDIR: process.env.WINDIR,
      TEMP: process.env.TEMP,
      TMP: process.env.TMP,
    },
  });
  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);
  assert.ifError(result.error);
  assert.equal(result.status, 0, "--dry-run debe terminar correctamente con la guardia activa");
  assert.match(result.stdout, /Vista previa \(--dry-run\)/);
  assert.match(result.stdout, /Total: \d+ archivos, \d+ fragmentos/);
  assert.match(result.stdout, /Guardia: 0 procesos externos, 0 conexiones\./);
  console.log("OK: --dry-run no inicia Python ni se conecta a PostgreSQL.");
}
