let imgElement = document.getElementById('imageSrc');
let inputElement = document.getElementById('fileInput');
inputElement.addEventListener('change', (e) => {
  imgElement.src = URL.createObjectURL(e.target.files[0]);
}, false);

imgElement.onload = function() {
  try
    {
      let src = cv.imread(imgElement);
      let dst = new cv.Mat();
      let hsv = new cv.Mat();
      cv.cvtColor(src,hsv,cv.COLOR_RGB2HSV,0)
    
      //INSERT CODE HERE
    
      let low = new cv.Mat(hsv.rows, hsv.cols, hsv.type(), [80,0,155,0]);
      let high = new cv.Mat(hsv.rows, hsv.cols, hsv.type(), [140,255,255,255]);
      cv.inRange(hsv,low,high,dst);

      //Finish
      cv.imshow('canvasInput', src);
      cv.imshow('outputHSV',hsv);
      cv.imshow('outputMask',dst);
    
      src.delete();
      dst.delete();
      hsv.delete();
      low.delete();
      high.delete();
    }
  catch(e)
    {
      console.error(e)
    }
};
function onOpenCvReady() {
    document.getElementById('status').innerHTML = 'OpenCV.js is ready.';
  }