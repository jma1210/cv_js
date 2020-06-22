let imgElement = document.getElementById('imageSrc');
let inputElement = document.getElementById('fileInput');
inputElement.addEventListener('change', (e) => {
  imgElement.src = URL.createObjectURL(e.target.files[0]);
}, false);

//contour class to ease sorting
function SortableContour(areaSize,contour)
  {
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
      // Sort contours from largest to smallest
      ArrCnts = [];
      for(let i = 0; i < contours.size(); ++i)
        {
          let cnt = contours.get(i);
          let area = cv.contourArea(cnt, false);

          ArrCnts.push(new SortableContour(area,cnt));
          
        }
      //Extract the n largest contours
      //Extract the contour with 4 corners that is also the largest contour ( so far )
      ArrCnts.sort(function(item1,item2){return item2.areaSize - item1.areaSize});
      let biggestCnts = ArrCnts.slice(0,15);
      let approxCnt = new cv.Mat();

      //Debugging messages

      // console.log(ArrCnts.length);
      // console.log(biggestCnts.length);

      let approx = new cv.Mat();
      for(let j = 0 ; j < biggestCnts.length ; ++j)
        {
          let peri = cv.arcLength(biggestCnts[j].contour,true);
          cv.approxPolyDP(biggestCnts[j].contour,approx,peri*0.015,true);

          if(approx.rows==4)
            {
              console.log("Appropriate contour has been found !")
              break;
            }
          else
            {
              console.log("APPROPRIATE CONTOUR NOT FOUND")
              return;
            }
        }
      
      
      // //Extract corner data from photo
      // let cornerArray = []
      // if(boxCnt != null)
      //   {
      //     cornerArray.push( new cv.Point(foundContour.data32S[0], foundContour.data32S[1]));
      //     cornerArray.push( new cv.Point(foundContour.data32S[2], foundContour.data32S[3]));
      //     cornerArray.push( new cv.Point(foundContour.data32S[4], foundContour.data32S[5]));
      //     cornerArray.push( new cv.Point(foundContour.data32S[6], foundContour.data32S[7]));
      //   }
      // else
      //   {
      //     console.log("No box contour found")
      //     return;
      //   }
      // //Reorder corners tl tr br bl
      // cornerArray.sort(function(a,b){return b.y-a.y});
      // for(let i = 0 ; i < cornerArray.length ; ++i)
      //   {
      //     console.log("This is a corner ("+cornerArray[i].x+","+cornerArray[i].y+")");
      //   }
      //Do perspective transform
      //Show the images in their respective canvases
      cv.imshow('canvasInput', src);
      cv.imshow('outputHSV',hsv);
      cv.imshow('outputMask',mask);
      // cv.imshow('outputBound',bound);

      //Delete all matrices after used
      org.delete();
      src.delete();
      mask.delete();
      bound.delete();
      low.delete();
      high.delete();
      contours.delete();
      hierarchy.delete();
      approxCnt.delete();
      // boxCnt.delete();
    }
  catch(e)
    {
      console.error(e)
    }
};

function onOpenCvReady() {
    document.getElementById('status').innerHTML = 'OpenCV.js is ready.';
  }

  