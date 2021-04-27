FROM hayd/alpine-deno:1.7.2

WORKDIR /app

# Prefer not to run as root.
USER deno

# These steps will be re-run upon each file change in your working directory:
COPY . .
# Compile the main app so that it doesn't need to be compiled each startup/entry.

# These are passed as deno arguments when run with docker:
CMD ["run", "--allow-read", "--allow-net", "src/mod.ts"]

EXPOSE 8000
