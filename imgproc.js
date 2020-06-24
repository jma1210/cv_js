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
imgElement.onload =
    function() {
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
          //Try and detect the blurryness of an image
            let gray = new cv.Mat();
            cv.cvtColor(src,gray,cv.COLOR_RGB2GRAY,0);
            let laplace = new cv.Mat();
            cv.Laplacian(gray,laplace,cv.CV_8U,1,1,0,cv.BORDER_DEFAULT);
            let mean = new cv.Mat();
            let std = new cv.Mat();
            cv.meanStdDev(laplace,mean,std);
            let varLaplace = Math.pow(std.doubleAt(0,0),2);
            if(varLaplace>200)
              {
                console.log("Not blurry : "+varLaplace);
              }
            else
              {
                console.log("Blurry : "+varLaplace);
                    org.delete();
                    src.delete();
                    gray.delete();
                    laplace.delete();
                    mean.delete();
                    std.delete();
                return;
              }
            let hsv = new cv.Mat();
            let mask = new cv.Mat();
            let cropped = new cv.Mat();
            cv.cvtColor(src,hsv,cv.COLOR_RGB2HSV,0)
        
          //Filter blue color of given ID image
            let low = new cv.Mat(hsv.rows, hsv.cols, hsv.type(), [75,0,100,0]);
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
              ArrCnts.sort(function(item1,item2){return item2.areaSize - item1.areaSize});
          //Extract the n largest contours
          //Extract the contour with 4 corners that is also the largest contour ( so far )
          
            let biggestCnts = ArrCnts.slice(0,15);
            let approxCnt = new cv.Mat();
          //Get the largest contour and put it in approxCnt
            for(let j = 0 ; j < biggestCnts.length ; ++j)
              {
                let peri = cv.arcLength(biggestCnts[j].contour,true);
                cv.approxPolyDP(biggestCnts[j].contour,approxCnt,peri*0.015,true);
    
                if(approxCnt.rows==4)
                  {
                    console.log("Appropriate contour has been found !")
                    break;
                  }
                else
                  {
                    console.error("APPROPRIATE CONTOUR NOT FOUND")
                        org.delete();
                        src.delete();
                        hsv.delete();
                        gray.delete();
                        laplace.delete();
                        mean.delete();
                        std.delete();
                        mask.delete();
                        cropped.delete();
                        low.delete();
                        high.delete();
                        contours.delete();
                        hierarchy.delete();
                        approxCnt.delete();
                    return;
                  }
              }
          //Get the 4 corners
            cornerArray = []
            cornerArray.push(new cv.Point(approxCnt.data32S[0],approxCnt.data32S[1]));
            cornerArray.push(new cv.Point(approxCnt.data32S[2],approxCnt.data32S[3]));
            cornerArray.push(new cv.Point(approxCnt.data32S[4],approxCnt.data32S[5]));
            cornerArray.push(new cv.Point(approxCnt.data32S[6],approxCnt.data32S[7]));  
          // //Reorder corners tl tr br bl
            let sortedSum = cornerArray.sort(function(a,b){return((a.x+a.y)-(b.x+b.y))});
            let tl = sortedSum[0];
            let br = sortedSum[3];
            let sortedDiff = cornerArray.sort(function(a,b){return((a.x-a.y)-(b.x-b.y))});
            let tr = sortedDiff[3];
            let bl = sortedDiff[0];
            
          //Calculate the width and height of the new picture to be used
          let widthBot = Math.hypot(br.x-bl.x,br.y-bl.y);
          let widthTop = Math.hypot(tr.x-tl.x,tr.y-tl.y);
          let heightLeft = Math.hypot(tr.x-br.x,tr.y-br.y);
          let heightRight = Math.hypot(tl.x-bl.x,tl.y-bl.y);
          let actWidth = (widthBot>widthTop) ? widthBot:widthTop;
          let actHeight = (heightLeft>heightRight) ? heightLeft:heightRight;
    
          //Do perspective transform
          //Get the matrix of transformation
          let finalCoords = new cv.matFromArray(4,1,cv.CV_32FC2,[0,0,actWidth-1,0,actWidth-1,actHeight-1,0,actHeight-1]);
          let sourceCoords = new cv.matFromArray(4,1,cv.CV_32FC2,[tl.x,tl.y,tr.x,tr.y,br.x,br.y,bl.x,bl.y]);
          dsize = new cv.Size(actWidth,actHeight);
          let Matrix = cv.getPerspectiveTransform(sourceCoords,finalCoords);
          cv.warpPerspective(src,cropped,Matrix,dsize,cv.INTER_LINEAR,cv.BORDER_CONSTANT,new cv.Scalar())
          //Show the images in their respective canvases
            cv.imshow('canvasInput', src);
            cv.imshow('outputHSV',hsv);
            cv.imshow('outputMask',mask);
            cv.imshow('outputCropped',cropped);
    
          //Delete all matrices after used
            org.delete();
            src.delete();
            gray.delete();
            laplace.delete();
            mean.delete();
            std.delete();
            hsv.delete();
            mask.delete();
            cropped.delete();
            low.delete();
            high.delete();
            contours.delete();
            hierarchy.delete();
            approxCnt.delete();
            finalCoords.delete();
            sourceCoords.delete();
            Matrix.delete();
        }
      catch(e)
        {
          console.error("gg get rekt: " + cv.exceptionFromPtr(e).msg);
        }
    };

function onOpenCvReady() {
    document.getElementById('status').innerHTML = 'OpenCV.js is ready.';
  }

  