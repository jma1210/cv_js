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
      cv.cvtColor(src,src,cv.COLOR_RGB2HSV)
    
      //INSERT CODE HERE
    
      let low = new cv.Mat(src.rows, src.cols, src.type(), [80,0,155,0]);
      let high = new cv.Mat(src.rows, src.cols, src.type(), [140,255,255,255]);
      cv.inRange(src,low,high,dst);

      //Finish
      cv.imshow('canvasInput', src);
      cv.imshow('outputMask',dst);
    
      src.delete();
      dst.delete();
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