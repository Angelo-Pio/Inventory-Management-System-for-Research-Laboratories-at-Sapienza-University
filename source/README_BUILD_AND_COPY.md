Build and copy script

This small helper builds the Java submodules (auth, back-end, notification) and copies
their produced JAR files into the `Docker/` folder so Docker images or compose can pick
them up.

Usage (from the `source/` folder):

```bash
# Make script executable if needed
chmod +x ./build_and_copy.sh

# Run it
./build_and_copy.sh
```

What it does:
- Runs `./mvnw -DskipTests package` in each module folder: `auth`, `back-end`, `notification`.
- Copies produced JAR(s) from each module `target/` directory into `source/Docker/`.

Notes:
- The script is idempotent and will overwrite JARs in `Docker/` if they already exist.
- You need a working JDK and network access for Maven to download dependencies.
- If one module fails to build the script will continue with the others but will report
  the error.
