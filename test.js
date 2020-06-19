let imgElement = document.getElementById('imageSrc');
let inputElement = document.getElementById('fileInput');
inputElement.addEventListener('change', (e) => {
  imgElement.src = URL.createObjectURL(e.target.files[0]);
}, false);

imgElement.onload = function() {
  let mat = cv.imread(imgElement);
  let dst = new cv.Mat();
  cv.cvtColor(mat,dst,cv.COLOR_RGBA2HSV);
  cv.imshow('canvasOutput',dst);
  cv.imshow('canvasInput', mat);

  //INSERT CODE HERE
  mat.delete();
};
function onOpenCvReady() {
    document.getElementById('status').innerHTML = 'OpenCV.js is ready.';
  }