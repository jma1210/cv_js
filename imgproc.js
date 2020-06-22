let imgElement = document.getElementById('imageSrc');
let inputElement = document.getElementById('fileInput');
inputElement.addEventListener('change', (e) => {
  imgElement.src = URL.createObjectURL(e.target.files[0]);
}, false);

//contour class to ease sorting
function SortableContours(perimeterSize,areaSize,contour)
  {
    this.perimeterSize = perimeterSize;
    this.areaSize = areaSize;
    this.contour = contour;
  }

imgElement.onload = function() {
  try
    {
      //Make matrices needed to store images, show the process
      let org = cv.imread(imgElement);
      //Calculate the ratio
      let width = 600;
      let ratio = 0;
        let newWidth = 0;
        let newHeight = 0;
        if ( org.cols > 0)
          {
            ratio = 600/org.cols;
            newWidth = org.cols * ratio;
            newHeight = org.rows * ratio;
          }
        // create new size matrix
        let dsize = new cv.Size(newWidth,newHeight);
      
      let src = new cv.Mat();
      //perform resizing with src as destination matrix
      cv.resize(org,src,dsize,0,0,cv.INTER_AREA);


      let hsv = new cv.Mat();
      let mask = new cv.Mat();
      let bound = new cv.Mat();
      cv.cvtColor(src,hsv,cv.COLOR_RGB2HSV,0)
    
      //Filter blue color of given ID image
      let low = new cv.Mat(hsv.rows, hsv.cols, hsv.type(), [80,0,155,0]);
      let high = new cv.Mat(hsv.rows, hsv.cols, hsv.type(), [140,255,255,255]);
      cv.inRange(hsv,low,high,mask);

      //Get matrix object for contours
      let contours = new cv.MatVector();
      let hierarchy = new cv.Mat();
      //Find the contours of the image
      cv.findContours(mask,contours,hierarchy,cv.RETR_TREE,cv.CHAIN_APPROX_SIMPLE);
      //Sort contours from largest to smallest
      //Extract the 4 largest contours
      //Get the corners of the contour
      //Reorder corners tl tr br bl
      //Do perspective transform
      //Show the images in their respective canvases
      cv.imshow('canvasInput', src);
      cv.imshow('outputHSV',hsv);
      cv.imshow('outputMask',mask);
      cv.imshow('outputBound',bound);
      //Delete all matrices after used
      org.delete();src.delete();dst.delete();mask.delete();bound.delete();low.delete();high.delete();contours.delete();hierarchy.delete();
    }
  catch(e)
    {
      console.error(e)
    }
};

function onOpenCvReady() {
    document.getElementById('status').innerHTML = 'OpenCV.js is ready.';
  }

  