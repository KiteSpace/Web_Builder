###############################################
# CLEAN UP APPLEDOUBLE METADATA FILES
###############################################

# Remove all "._*" ghost files (macOS extended attributes)
find . -type f -name "._*" -print -delete


###############################################
# CLEAN UP STRAY PREVIEW/BUNDLER FILES
###############################################

# Remove top-level bundler files that shouldn't exist
rm -f ./bundler.ts
rm -f ./previewRuntime.js
rm -f ./preview-runtime.js
rm -f ./previewRuntime.ts

# Remove any stray preview files at root or wrong locations
find . -maxdepth 2 -type f -name "buildWorker.*" ! -path "./src/preview/*" -print -delete
find . -maxdepth 2 -type f -name "bundler.*" ! -path "./src/preview/*" -print -delete
find . -maxdepth 2 -type f -name "bundler.worker.*" ! -path "./src/preview/*" -print -delete
find . -maxdepth 2 -type f -name "fileSystem.*" ! -path "./src/preview/*" -print -delete
find . -maxdepth 2 -type f -name "moduleGraph.*" ! -path "./src/preview/*" -print -delete
find . -maxdepth 2 -type f -name "iframeRuntime.*" ! -path "./src/preview/*" -print -delete


###############################################
# CLEAN UP EMPTY GHOST FILES
###############################################
find ./src/preview -type f -size 0 -print -delete


###############################################
# PRINT RESULT
###############################################
echo "Cleanup complete!"
echo "Your preview system should now only exist in:"
echo "  ./src/preview/"
