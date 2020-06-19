let imgElement = document.getElementById('imageSrc');
let inputElement = document.getElementById('fileInput');
inputElement.addEventListener('change', (e) => {
  imgElement.src = URL.createObjectURL(e.target.files[0]);
}, false);

imgElement.onload = function() {
  let src = cv.imread(imgElement);
  let dst = new cv.Mat();
  cv.cvtColor(src,dst,cv.COLOR_RGB2HSV);

  //INSERT CODE HERE

  //Finish
  cv.imshow('canvasInput', src);
  cv.imshow('canvasOutput',dst);

  mat.delete();
  dst.delete();
};
function onOpenCvReady() {
    document.getElementById('status').innerHTML = 'OpenCV.js is ready.';
  }