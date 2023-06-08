/*
 * Copyright (c) 2016 Samsung Electronics Co., Ltd. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

(function() {
    var canvasLayout,
        canvasContent,
        ctxLayout,
        ctxContent,
        center,
        watchRadius;
    var pS = {value:0}; // the size of each particle position drawn
    var a = {value:0},b = {value:0},c = {value:0},d = {value:0};
	var scale = 4, // a scale factor
		yPos = 2; // y translation
	var xp, x = 0, y = 0, t = 0;
	var S = 255;
	var lineColor = "#008099";
	var n = 10000;
	var attractorCenter = 0;
	var state = 0;
	var lowerHeartThreshold = 60;
	var upperHeartThreshold = 100;
	var attractor = 0;
	var heartRateRanges = [
	                       { min: -50, max: 49, color: "#188AF0" },
	                       { min: 50, max: 59, color: "#00B7D8" },
	                       { min: 60, max: 79, color: "#00D4B0" },
	                       { min: 80, max: 99, color: "#00E54B" },
	                       { min: 100, max: 119, color: "#F48846" },
	                       { min: 120, max: 139, color: "#E94740" },
	                       { min: 140, max: 159, color: "#FF0000" },
	                       { min: 160, max: Infinity, color: "#FF0000" } 
	                     ];
	var heartRate = 0;
	var movementStatus = "WALKING";
	var timeInterval = 10;
	
	function onsuccessCB(hrmInfo) {
		if (hrmInfo.heartRate >= lowerHeartThreshold && hrmInfo.heartRate <= upperHeartThreshold) {
			state = 0;
		} else {
			state = 1;
		}
		
		heartRate = hrmInfo.heartRate;
	}
	
	function movementDetection(pedometerInfo) {
		movementStatus = pedometerInfo.stepStatus;
	}
	// ENABLE AFTER DEMOSTRATION TEST 
	tizen.humanactivitymonitor.start('HRM', onsuccessCB);
	tizen.humanactivitymonitor.start("PEDOMETER", movementDetection);
	// ENABLE AFTER DEMOSTRATION TEST 
    /**
     * Renders a circle with specific center, radius, and color
     * @private
     * @param {object} context - the context for the circle to be placed in
     * @param {number} radius - the radius of the circle
     * @param {string} color - the color of the circle
     */
    function renderCircle(context, center, radius, color) {
        context.save();
        context.beginPath();
        context.fillStyle = color;
        context.arc(center.x, center.y, radius, 0, 2 * Math.PI);
        context.fill();
        context.closePath();
        context.restore();
    }

    /**
     * Renders a needle with specific center, angle, start point, end point, width and color
     * @private
     * @param {object} context - the context for the needle to be placed in
     * @param {number} angle - the angle of the needle (0 ~ 360)
     * @param {number} startPoint - the start point of the needle (-1.0 ~ 1.0)
     * @param {number} startPoint - the end point of the needle (-1.0 ~ 1.0)
     * @param {number} width - the width of the needle
     * @param {string} color - the color of the needle
     */
    function renderNeedle(context, angle, startPoint, endPoint, width, color) {
        var radius = context.canvas.width / 2,
            centerX = context.canvas.width / 2,
            centerY = context.canvas.height / 2,
            dxi = radius * Math.cos(angle) * startPoint,
            dyi = radius * Math.sin(angle) * startPoint,
            dxf = radius * Math.cos(angle) * endPoint,
            dyf = radius * Math.sin(angle) * endPoint;

        context.save();
        context.beginPath();
        context.lineWidth = width;
        context.strokeStyle = color;
        context.moveTo(centerX + dxi, centerY + dyi);
        context.lineTo(centerX + dxf, centerY + dyf);
        context.stroke();
        context.closePath();
        context.restore();
    }

    /**
     * Renders text at a specific center, radius, and color
     * @private
     * @param {object} context - the context for the text to be placed in
     * @param {string} text - the text to be placed
     * @param {number} x - the x-coordinate of the text
     * @param {number} y - the y-coordinate of the text
     * @param {number} textSize - the size of the text in pixel
     * @param {string} color - the color of the text
     */
//    function renderText(context, text, x, y, textSize, color) {
//        context.save();
//        context.beginPath();
//        context.font = textSize + "px Courier";
//        context.textAlign = "center";
//        context.textBaseline = "middle";
//        context.fillStyle = color;
//        context.fillText(text, x, y);
//        context.closePath();
//        context.restore();
//    }

    /**
     * Draws the basic layout of the watch
     * @private
     */    
    function drawWatchLayout() {
        // Clear canvas
        ctxLayout.clearRect(0, 0, ctxLayout.canvas.width, ctxLayout.canvas.height);

        // Draw the background circle
        renderCircle(ctxLayout, center, watchRadius, "#000000");
    }

    /**
     * Draws the content of the watch
     * @private
     */
    function drawWatchContent() {
        var datetime = tizen.time.getCurrentDateTime(),
            hour = datetime.getHours(),
            minute = datetime.getMinutes(),
            second = datetime.getSeconds();

        // Clear canvas
        ctxContent.clearRect(0, 0, ctxContent.canvas.width, ctxContent.canvas.height);

        // Draw the hour needle
        renderNeedle(ctxContent, Math.PI * (((hour + minute / 60) / 6) - 0.5), 0, 0.50, 3, "#454545");

        // Draw the minute needle
        renderNeedle(ctxContent, Math.PI * (((minute + second / 60) / 30) - 0.5), 0, 0.70, 3, "#454545");

        // Draw the minute/hour circle
        renderCircle(ctxContent, center, 8, "#454545");

        // Draw the second needle
        ctxContent.shadowOffsetX = 4;
        ctxContent.shadowOffsetY = 4;
        renderNeedle(ctxContent, Math.PI * ((second / 30) - 0.5), -0.10, 0.85, 1, "#c4c4c4");

        // Draw the second circle
        ctxContent.shadowOffsetX = 0;
        ctxContent.shadowOffsetY = 0;
        renderCircle(ctxContent, center, 5, "#c4c4c4");

        // Draw the center circle
        renderCircle(ctxContent, center, 2, "#454545");

        // Draw the text for date
        //renderText(ctxContent, date, center.x, center.y + (watchRadius * 0.5), 25, "#999999");
    }

    /**
     * sets the values for the Attractor
     * @private
     */
    function setValues(options) {
    	  a.value = options.vala;
    	  b.value = options.valb;
    	  c.value = options.valc;
    	  d.value = options.vald;
    	  pS.value = options.psize;
    	  scale = options.div;
    	  yPos = options.yMove;
    	}
    function deJongAttractor(){
		xp = x;		
		x = Math.sin(a.value * y) - Math.cos(b.value * xp);
		y = Math.sin(c.value * xp) - Math.cos(d.value * y);
		ctxLayout.fillRect(x * S/scale + S/2 + ((360-S)/2), y * S/scale + S/yPos + ((360-S)/2), pS.value, pS.value);
    }
    
    function pickOverAttractor(){
		xp = x;
		x = Math.sin(a.value * y) + c.value * Math.cos(a.value * xp);
		y = Math.sin(b.value * xp) + d.value * Math.cos(b.value * y);
		
		if (attractorCenter === 0){
			ctxLayout.fillRect(x * S/scale + S/2 + ((360-S)/2), y * S/scale + S/yPos + ((360-S)/2), pS.value, pS.value);
		} else {
			ctxLayout.fillRect(x * S/scale + S/2 + ((360-S)/2), y * S/scale + S/yPos + ((360-S)/2)-50, pS.value, pS.value);
		}
    }
    
    function randomAttractor(){
    	  x = Math.random() * 360;
    	  y = Math.random() * 360;
    	  pS= Math.floor(Math.random() * 6 + 5);
    	  ctxLayout.fillRect(x,y,pS,pS);
    }
    /**
     * Draws the Attractor
     * @private
     */
    function drawAttractor() {
		if (heartRate > 160) {
			  var randomColor = "#" + Math.floor(Math.random() * 16777215).toString(16);
			  lineColor = randomColor;
		} else {
			for (var i = 0; i < heartRateRanges.length; i++) {
				var range = heartRateRanges[i];
				if (heartRate >= range.min && heartRate <= range.max) {
					lineColor = range.color;
				    break;
				}
			}
		}
		
    	ctxLayout.fillStyle = lineColor;
    	
    	if (attractor === 0 && heartRate < 160) {
    		ctxLayout.globalAlpha = 0.2;
    		if(t < n) {
    			for (var q = n; q--;) {
    				deJongAttractor();
    			}
    			t++;
    		} 
    	} else if (attractor === 1 && heartRate < 160){
    		ctxLayout.globalAlpha = 0.2;
    		if(t < n) {
    			for (var qz = n; qz--;) {
    				pickOverAttractor();
    			}
    			t++;
    		} 
    	} else {
    		ctxLayout.globalAlpha = 1;
    		if(t < n){
    			for (var rhr = 10; rhr--;){
    				randomAttractor();
    			}
    			t++;
    		}
    	}
    }
    
    
    /**
     * Set default variables
     * @private
     */
    function setDefaultVariables() {
        canvasLayout = document.querySelector("#canvas-layout");
        ctxLayout = canvasLayout.getContext("2d");
        canvasContent = document.querySelector("#canvas-content");
        ctxContent = canvasContent.getContext("2d");

        // Set the canvases square
        canvasLayout.width = document.body.clientWidth;
        canvasLayout.height = canvasLayout.width;
        canvasContent.width = document.body.clientWidth;
        canvasContent.height = canvasContent.width;

        center = {
            x: document.body.clientWidth / 2,
            y: document.body.clientHeight / 2
        };

        watchRadius = canvasLayout.width / 2;
        setValues({
        	  vala: 1.4,
        	  valb: -2.3,
        	  valc: 2.4,
        	  vald: -2.1,
        	  psize: 0.3,
        	  div: 4.5,
        	  yMove: 2
        	});
    }

    /**
     * Set default event listeners
     * @private
     */
    function setDefaultEvents() {
        // add eventListener to update the screen immediately when the device wakes up
        document.addEventListener("visibilitychange", function() {
            if (!document.hidden) {    		
                // Draw the content of the watch
                drawWatchContent();
                drawWatchLayout();
                switch (true) {
    	    	case (movementStatus === "NOT_MOVING"):
    	    		timeInterval = 500;
    	    		break;
    	    	case (movementStatus === "WALKING"):
    	    		timeInterval = 100;
    	    		break;
    	    	case (movementStatus === "RUNNING"):
    	    		timeInterval = 1;
    	    		break;
            }
//            	tizen.humanactivitymonitor.start('HRM', onsuccessCB);
            	var randomIndex = Math.random();
                if (state === 0) {
                    switch (true) {
	                	case (randomIndex < 0.25):
	                		setValues({vala: -2,valb: 2,valc: 1,vald: 1,psize: 0.3,div: 4.5,yMove: 2});
	                		attractor = 1;
	                    	break;
	                    case (randomIndex >= 0.25 && randomIndex < 0.5):
	                    	setValues({vala: -1.531,valb: 1.856,valc: 1.876,vald: -1.589,psize: 0.3,div: 4.5,yMove: 2});
	                    	attractor = 1;
	                		break;
	                	case (randomIndex >= 0.5 && randomIndex < 0.75):
	                		setValues({vala: 1.9,valb: 1.8,valc: 1.9,vald: 1.9,psize: 0.3,div: 4.5,yMove: 2});
	                		attractor = 0;
	                    	break;
	                	case (randomIndex >= 0.75):
	                    	setValues({vala: -1.531,valb: 1.856,valc: 1.876,vald: -1.589,psize: 0.3,div: 4.5,yMove: 2});
	                		attractor = 0;
	                    	break;
                    }
                } else {
                	switch (true) {
	                	case (randomIndex < 0.25):
	                		setValues({vala: 1.1,valb: 1.7,valc: 1.9,vald: -1.2,psize: 0.3,div: 4.5,yMove: 2});
	                		attractor = 1;
	                    	break;
	                    case (randomIndex >= 0.25 && randomIndex < 0.5):
	                    	setValues({vala: -2,valb: 0.6,valc: -2,vald: 1.6,psize: 0.3,div: 4.5,yMove: 2});
	                    	attractor = 1;
	                    	attractorCenter = 1;
	                		break;
	                	case (randomIndex >= 0.5 && randomIndex < 0.75):
	                		setValues({vala: 2.771,valb: 2.771,valc: 0.8,vald: -0.791,psize: 0.3,div: 4.5,yMove: 2});
	                		attractor = 0;
	                    	break;
	                	case (randomIndex >= 0.75):
	                    	setValues({vala: 2.669,valb: 2.518,valc: -0.627,vald: 1.533,psize: 0.3,div: 4.5,yMove: 2});
	                		attractor = 0;
	                    	break;
                	}
                }
            }
            else {
                x = y = t = 0;
                ctxLayout.clearRect(0, 0, ctxLayout.canvas.width, ctxLayout.canvas.height);
                //tizen.humanactivitymonitor.stop('HRM');
                attractor = 0;
                attractorCenter = 0;
            }
        });
    }
       
    /**
     * Initiates the application
     * @private
     */
    function init() {
        setDefaultVariables();
        setDefaultEvents();
     
        // Draw the basic layout and the content of the watch at the beginning
        drawWatchLayout();
        drawAttractor();
        
        function drawContent() {
            drawAttractor();
            setTimeout(drawContent, timeInterval);
          }
        
        setTimeout(drawContent, timeInterval);
        
        //Update the content of the watch every second
        setInterval(function() {
            drawWatchContent();
        }, 1000);

    }

    window.onload = init;
    }());