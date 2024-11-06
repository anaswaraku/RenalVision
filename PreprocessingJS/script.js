function onOpenCvReady() {
  document
    .getElementById("imageInput")
    .addEventListener("change", handleImageUpload);
}

function handleImageUpload(event) {
  let file = event.target.files[0];
  let reader = new FileReader();
  reader.onload = function (e) {
    let img = new Image();
    img.onload = function () {
      let canvas = document.getElementById("canvas");
      let ctx = canvas.getContext("2d");
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0, img.width, img.height);
      let src = cv.imread(canvas);
      processImage(src);
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function processImage(src) {
  // CLAHE alternative for OpenCV.js
  let gray = new cv.Mat();
  cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0);
  let claheDst = applyCLAHE(gray);
  displayImage(claheDst, "CLAHE");

  // Gaussian Blur
  let blurred = new cv.Mat();
  cv.GaussianBlur(claheDst, blurred, new cv.Size(5, 5), 0);
  displayImage(blurred, "Gaussian Blurred");

  // Cleanup
  gray.delete();
  claheDst.delete();
  blurred.delete();
  binary.delete();
  contours.delete();
  hierarchy.delete();
  contourImage.delete();
}

function applyCLAHE(src) {
  // Create CLAHE (Contrast Limited Adaptive Histogram Equalization) alternative in OpenCV.js
  let lab = new cv.Mat();
  cv.cvtColor(src, lab, cv.COLOR_GRAY2RGB);
  cv.cvtColor(lab, lab, cv.COLOR_RGB2Lab);

  let lab_planes = new cv.MatVector();
  cv.split(lab, lab_planes);

  let l = lab_planes.get(0);
  let clahe = new cv.Mat();
  cv.equalizeHist(l, clahe);

  lab_planes.set(0, clahe);
  cv.merge(lab_planes, lab);
  cv.cvtColor(lab, lab, cv.COLOR_Lab2RGB);
  cv.cvtColor(lab, lab, cv.COLOR_RGB2GRAY);

  l.delete();
  lab.delete();
  lab_planes.delete();
  return clahe;
}

function displayImage(mat, title) {
  let canvas = document.getElementById("canvas");
  cv.imshow(canvas, mat);
  console.log(title);
}
