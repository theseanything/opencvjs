# Image processing with OpenCV.js

Demo page using OpenCV.js for image processing. The page simply takes in an input image at the top and runs them through a set of image processing steps.

Currently configured to use WebAssembly - so the page needs accessed via http to run. I used [Emscripten](https://kripken.github.io/emscripten-site/index.html) to [compile the WebAssembly](https://docs.opencv.org/3.4.0/d4/da1/tutorial_js_setup.html) seperately and used `emrun index.html` server the pages locally.
