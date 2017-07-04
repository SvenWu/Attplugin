(function() {
	
	var httpRequest = new XMLHttpRequest();;
	
	var queryId = window.location.hash.split('&')[1]?window.location.hash.split('&')[1].split('=')[1]:'';
	

  	var config = {};
  	config.workStartsAt = [];
  	for (e in defaultVal) {
    	config[e] = defaultVal[e].value;
	}

	

	var modalHelper;

	chrome.storage.sync.get(
		config
	, function(items) {
		for (e in config) {
			// console.log(items);
			if (Array.isArray(config[e]) && !Array.isArray(items[e])) {
				config[e] = items[e].split(',');
			} else {
				config[e] = items[e];  
			}
		}

		modalHelper = initRTC();
		initATT();
	});

	// console.log(config);
  	
	var clearSprintData = function() {
		$sprintData = {

		    'defects' : 0, // defects
		    'defectsClosed' : 0, // defectsClosed
		    'commStories' : 0,// commStories
		    'commStoriesDel' : 0,// commStoriesDel
		    'commPoints' : 0, // commPoints
		    'commPointsDel' : 0, // commPointsDel
		    'WIPTotal' : 0,
		    'cycleTimeWIP' : 0, // cycleTimeWIP
		    'BLTotal' : 0,
		    'cycleTimeInBacklog' : 0, // cycleTimeInBacklog
		    'clientSatisfaction' : 4,
		    'teamSatisfaction' : 4,
		    'commFeatures': [],
		    'BLLength' : 0

		};
	}

	String.prototype.indexOfR = function(items, fixation) {
		var prefix = '';
		if (typeof fixation == 'undefined' || fixation) {
			var prefix = config.historyArrowSym;
		}
		if (Array.isArray(items)) {
			for (i=0; i<items.length; i++) {
				if (this.indexOf(prefix+items[i]) >= 0) {
					return 1;
				}
			}
		} else {
			return this.indexOf(prefix+items);
		}
		return -1;
	}

	BridgeATT = function() {
		this.apiKey   = config.attAPIKEY;
		this.teamInfo = null;
		this.iterations = null;
		this.url      = config.attURL+'/v1/';
		this.headers  = {'apiKey': this.apiKey}
	}

	BridgeATT.prototype.getTeamInfo = function() {
		var that = this;
		return new Promise(function(resolve, reject) {

			if (that.teamInfo !== null) {
				resolve(that.teamInfo);
			} else {
				$.ajax({
		            url: that.url+'teams',
		            type: 'GET',
		            dataType: 'json',
		            data: {},
		            headers: that.headers,
		            // beforeSend: function(xhr){xhr.setRequestHeader(, );},
		            success: function (data, textStatus, xhr) {
		                // var teamId = data[0]['_id'];
		                that.teamInfo=data[0];
		                resolve(data[0]);
		                
		            },
		            error: function (xhr, textStatus, errorThrown) {
		                // var s = document.createElement('span');
		                // s.textContent=errorThrown;
		                // elem.appendChild(s);
		                reject(new Error(errorThrown));
		            }
		        });
			}
		});
	}

	BridgeATT.prototype.getIterations = function(teamId) {
		var that = this;
		return new Promise(function(resolve, reject) {
			if (that.iterations !== null) {
				resolve(that.iterations);
			} else {
				$.ajax({
		            url: that.url+'iterations?teamId='+teamId,
		            type: 'GET',
		            dataType: 'json',
		            data: {},
		            headers: that.headers,
		            // beforeSend: function(xhr){xhr.setRequestHeader(, );},
		            success: function (data, textStatus, xhr) {
		            	that.iterations=data;
		            	resolve(data);
		            },
		            error: function (xhr, textStatus, errorThrown) {
		                reject(new Error(errorThrown));
		                
		            }
		        });
			}
		});

	}

	BridgeATT.prototype.formatData = function(currentData, iterationId) {

		var data = {};
		var mapping = {
			'commStories' : 'committedStories',
			'commStoriesDel': 'deliveredStories', 
			'commPoints' : 'committedStoryPoints', 
			'commPointsDel' : 'storyPointsDelivered', 
		}
		for (e in currentData) {
			var index = (e in mapping)?mapping[e]:e;
			data[index] = currentData[e];
		}
		data['_id'] = iterationId;
		return data;
	}

	BridgeATT.prototype.setIteration = function(iterationId, data) {
		var that = this;
		var data = this.formatData(data, iterationId);
		// console.log(data);
		// return true;
		return new Promise(function(resolve, reject) {
			that.iterations=null;
			// resolve(data);
			// return;
			if (that.iterations !== null) {
				resolve(that.iterations);
			} else {
				$.ajax({
		            url: that.url+'iterations',
		            type: 'PUT',
		            dataType: 'json',
		            data: data,
		            headers: that.headers,
		            success: function (data, textStatus, xhr) {
		            	// that.iterations=data;
		            	resolve(data);
		            },
		            error: function (xhr, textStatus, errorThrown) {
		                reject(new Error(errorThrown));
		            }
		        });
			}
		});


	}

	var RTCQueryCacheResults = function() {
		
		this.queryResultCache = {};
		var that = this; 
		chrome.storage.sync.get(
			this.queryResultCache
		, function(items) {
				that.queryResultCache[e] = items[e];  
		});

	}

	RTCQueryCacheResults.prototype.get = function(id) {
		modalHelper.setMessage('loading sprintdata cache for query #'+id);
		if (id in this.queryResultCache) {
			modalHelper.setMessage('loaded sprintdata cache for query #'+id);
			return this.queryResultCache[id];
		}
		modalHelper.setMessage('Not able to load sprintdata cache for query #'+id, true);
		return null;
	}
	
	RTCQueryCacheResults.prototype.set = function(id, type, data) {
		this.queryResultCache[id] = this.queryResultCache[id] || {};
		this.queryResultCache[id][type]=data;
		modalHelper.setMessage('set sprintdata cache for query #'+id);
		this.update();
	}

	RTCQueryCacheResults.prototype.update = function() {
		chrome.storage.sync.set(this.queryResultCache,
			function() {
				modalHelper.setMessage('sprint result updated in cache');
		    
		})
	}

	RTCQueryCacheResults.prototype.unset = function(id) {
		delete this.queryResultCache[id];
		modalHelper.setMessage('unset sprintdata cache for query #'+id);
		this.update();
	}

	var rtcCache = new RTCQueryCacheResults();

	var RenderResult = function(result, items) {
		this.$sprintData=result;
		this.$defectsArr=items;
	}

	RenderResult.prototype.formatItems = function(items) {
		var itemsToDisplay 
			= ['parent','id','com.ibm.team.apt.attribute.complexity',
			'summary','workItemType','BL_end_date','BL_start_date','BL',
			'WIP_end_date','WIP_start_date','WIP'
			]

		return items.map(function(d, i) {
			var r = {};
			for (i=0; i<itemsToDisplay.length;i++) {
				r[itemsToDisplay[i]] = d[itemsToDisplay[i]];
			}
			return r;
		});

	}

	RenderResult.prototype.render = function() {
		$dataToDisplay = {};
        for (e in this.$sprintData) {
        	$dataToDisplay[$sprintDataLabel[e]] = this.$sprintData[e];
        }
		
		modalHelper.createTableFromJSON([$dataToDisplay]);


		var $functionToExecute = JSON.stringify($sprintData);

		modalHelper.addTitle('How would you like to fill the ATT?');

		modalHelper.renderCopy($functionToExecute);

		var  tabBody= modalHelper.addTab('automatic', 'Automatic Mode');
		modalHelper.renderBridgeATT(this.$sprintData, tabBody);


		modalHelper.createTableFromJSON(this.formatItems(this.$defectsArr), true);
	}

	function initRTC() {
		// console.log(config.rtcURL);
		// console.log(window.location.toString().indexOf(config.rtcURL));
		// if (window.location.toString().indexOf(config.rtcURL) < 0) {
			// return;
		// }

		if (!queryId) {
			return;
		}
		var att = new BridgeATT();

		

		config.rtcURL = window.location.origin;
		var parsedPath=window.location.pathname.split('/');
		config.servicePath = '/'+parsedPath[1]+'/service/';
		if ('servicePathC' in config
			&& config.servicePathC != ''
		) {
			config.servicePath = config.servicePathC;
		}
		
		

	   	var button = document.createElement('input');
		button.setAttribute('value', 'Generate ATT Fillings');
		button.setAttribute('type', 'button');
		button.setAttribute('id', 'myBtn');
		button.setAttribute('class', 'attButton');
		// document.getElementsByClassName('titleText')[0].parentNode.appendChild(button);
		document.body.insertBefore(button, document.body.childNodes[0]);
		// console.log('successfully added the button');

		var modalHtml = '<div id="myModal" class="modal"> <div class="modal-content"> <div class="modal-header">  <span class="close">&times;</span>&nbsp; <h4>RTC=> ATT  <span id="attReload" class="close">↻ Reload</span></h4> </div><div class="modal-body">  <div style="overflow:scroll" id="attFillingResult"></div>  <br /> <h6>Log Messages...</h6><div style="height:100px; overflow:scroll; background-color:black; color:white" id="attLogMessage"></div> </div></div></div>';
		var mainDiv = document.createElement('div');
		
		

		mainDiv.innerHTML = modalHtml;
		// document.getElementsByClassName('titleText')[0].parentNode.appendChild(mainDiv);
		document.body.insertBefore(mainDiv, document.body.childNodes[0])

		var modal = document.getElementById('myModal');
		var btn = document.getElementById("myBtn");
		var span = document.getElementsByClassName("close")[0];
		var attFillingResult = document.getElementById('attFillingResult');
		var attLogMessage = document.getElementById('attLogMessage');

		

		var initLoad = function(reload) {
			queryId = window.location.hash.split('&')[1]?window.location.hash.split('&')[1].split('=')[1]:'';

		  	if (typeof queryId == 'undefined' || 
		  		!isNaN(queryId)
		  	) {
		  		modalHelper.setMessage('Seems you are not in RTC query page!', true);
		      	return false;
		  	}

		  	attFillingResult.innerHTML = '';
			attLogMessage.innerHTML='';
		    modal.style.display = "block";


		  	if (!reload) {
		  		var cachedSprintData = rtcCache.get(queryId);
		  		if (cachedSprintData !== null) {
		  			var res = new RenderResult(cachedSprintData['sprintData'], cachedSprintData['defectsArr']);
		  			res.render();
		  			return;
		  		}
		  	}

		    makeRequestPost(
				config.rtcURL+config.servicePath+config.getResultURL,
				"startIndex=0&maxResults=100&itemId="+encodeURIComponent(queryId)
			);
		}

		btn.addEventListener('click', function() {
			initLoad();
			
		});

		document.getElementById('attReload').addEventListener('click', function() {
			initLoad(true);
		})


		// When the user clicks on <span> (x), close the modal
		span.onclick = function() {
		    modal.style.display = "none";
		}

		// When the user clicks anywhere outside of the modal, close it
		window.onclick = function(event) {
		    if (event.target == modal) {
		        modal.style.display = "none";
		    }
		}

		var copyTarget = function(elem) {
			var target = document.getElementById(elem);
			if (!target) {
				modalHelper.setMessage('Target Element Missing!');
				return;
			}
			target.focus();
		    target.setSelectionRange(0, target.value.length);
		    success = true;
		    try {
		    	success = document.execCommand("copy");
		    } catch(e) {
		    	success = false;
		    }

			if (!success) {
				modalHelper.setMessage('Cannot copy the content. Please help yourself!');
				target.style.display = "block";
			}
		};

		var getRandomColor = function () {
		  return 'rgb(' + (Math.floor((256-180)*Math.random()) + 230) + ',' + 
            (Math.floor((256-100)*Math.random()) + 230) + ',' + 
            (Math.floor((256-180)*Math.random()) + 230) + ')';
		};

		var getRandomColorHTML = function() {
			var items = ["DarkBlue","DarkCyan","DarkGoldenRod","DarkGray","DarkGrey",
			"DarkGreen","DarkKhaki","DarkOliveGreen","Darkorange","DarkOrchid",
			"DarkRed","DarkSalmon","DarkSeaGreen","DarkSlateBlue","DarkSlateGray","DarkSlateGrey",
			"DarkTurquoise","RosyBrown",
			"RoyalBlue","SaddleBrown","Salmon","SandyBrown","Sienna","SlateBlue","Tan",
			"Teal","Thistle","Tomato","Turquoise","Violet",];
			// items = ["DarkCyan", "Teal", "DarkSlateGrey"];
			return items[Math.floor(Math.random()*items.length)];

		}

		
		return {
			createCardsFromJSON: function(myJson, hideElem, returnTable) {
				var template = '<div class="container" style="{container-style}"><h4><b>{key}</b></h4></div><div class="info"><div class="text">{value}</div></div>';
				var mainContainer = document.createElement('div');
				mainContainer.setAttribute('class', 'cards-container');
				for (e in myJson) {
					var color = '#abbbd6';
					var c = document.createElement('div');
					c.setAttribute('class', 'card');
					c.setAttribute('style', 'border:1px solid '+color);
					var t=template;
					t = t.replace('{key}', e);
					t = t.replace('{value}', myJson[e]);
					t = t.replace('{container-style}', "background-color: "+color);
					c.innerHTML=t;
					mainContainer.appendChild(c);
				}
				if (returnTable) {
					return mainContainer;
				}

				var title = document.createElement('h6');
				title.textContent = 'Result';
		        if (hideElem) {
		        	title.addEventListener('click', function() {
		        		if (table.style.display=='block') {
		        			table.style.display = 'none';
		        		} else {
		        			table.style.display='block';
		        		}
		        	})
		        }

		        attFillingResult.appendChild(title);
		        attFillingResult.appendChild(mainContainer);

			},

			createTableFromJSON: function(myJson, hideElem, returnTable) {
				if (myJson.length == 1) {
					return this.createCardsFromJSON(myJson[0], hideElem, returnTable);
				}

		        var col = [];
		        for (var i = 0; i < myJson.length; i++) {
		            for (var key in myJson[i]) {
		                if (col.indexOf(key) === -1) {
		                    col.push(key);
		                }
		            }
		        }
		        var table = document.createElement("table");
		        var hideElemCSS = (hideElem)?'display:none;':'';
		        table.setAttribute('style', "border-collapse: collapse;border: 1px solid black;"+hideElemCSS);
		        table.setAttribute('class', 'new-table');
		        var tr = table.insertRow(-1); 
		        for (var i = 0; i < col.length; i++) {
		            var th = document.createElement("th"); 

		            th.setAttribute('style', "border: 1px solid black; background-color: "+getRandomColor());     // TABLE
																													// HEADER.
		            th.innerHTML = col[i];
		            tr.appendChild(th);
		        }
		        for (var i = 0; i < myJson.length; i++) {
		            tr = table.insertRow(-1);
		            for (var j = 0; j < col.length; j++) {
		                var tabCell = tr.insertCell(-1);
		                tabCell.setAttribute('style', "border: 1px solid black;"); 
		                tabCell.innerHTML = myJson[i][col[j]];
		            }
		        }
		        if (returnTable) {
		        	return table;
		        }
		        var title = document.createElement('h6');
		        title.textContent = (hideElem)?'All Work Items (Show/Hide)':'Result';

		        if (hideElem) {
		        	title.addEventListener('click', function() {

		        		if (table.style.display=='block') {
		        			table.style.display = 'none';
		        		} else {
		        			table.style.display='block';
		        		}
		        	})

		        }

		        attFillingResult.appendChild(title)
		        attFillingResult.appendChild(table);
    		},

    		close: function() {
    			modal.style.display = "none";
    		},

    		renderCopy: function(content) {

    			var tabBody = this.addTab('regular', 'Manual Mode');
    			document.getElementById("regular_header").click();

    			var button = document.createElement('input');
    			button.setAttribute('type', 'button');
    			button.setAttribute('value', 'Click here to copy the summary');
    			button.setAttribute('class', 'attButton');

    			var helpText = document.createElement('span');
    			// helpText.textContent = '& Paste the content in ATT browser
				// Console ';
    			helpText.innerHTML = '<br /> Now go to  <a href="'+config.attURL+'">'+config.attURL+'</a>, paste the content in the textbox and click the button "Execute"';

    			var textarea = document.createElement('textarea');
    			textarea.setAttribute('readonly', 'readonly');
    			textarea.setAttribute('id', 'hiddenCopyText');
    			// textarea.setAttribute('class', 'attButton');
    			textarea.textContent=content;

    			button.addEventListener('click', function(){
    				copyTarget('hiddenCopyText')
    			});
    			

    			var h6 = document.createElement('h6');
    			
    			tabBody.appendChild(button)
    			tabBody.appendChild(textarea)
				tabBody.appendChild(helpText)

				// var modalBody =
				// document.getElementsByClassName('modal-body')[0];
				
				
				// copyTarget('hiddenCopyText');

    		},

    		addTitle: function(title) {

    			var t = document.createElement('h6');
    			t.textContent = title;
    			attFillingResult.appendChild(t);

    		},

    		addTab: function(title, titleText) {

    			var openTab = function(evt, tabName) {
				    // Declare all variables
				    var i, tabcontent, tablinks;

				    // Get all elements with class="tabcontent" and hide them
				    tabcontent = document.getElementsByClassName("tabcontent");
				    for (i = 0; i < tabcontent.length; i++) {
				        tabcontent[i].style.display = "none";
				    }

				    // Get all elements with class="tablinks" and remove the
					// class "active"
				    tablinks = document.getElementsByClassName("tablinks");
				    for (i = 0; i < tablinks.length; i++) {
				        tablinks[i].className = tablinks[i].className.replace(" active", "");
				    }

				    // Show the current tab, and add an "active" class to the
					// button that opened the tab
				    document.getElementById(tabName).style.display = "block";
				    evt.currentTarget.className += " active";
				}


    			var tabConainer = document.getElementById('tab')
    			if (!tabConainer) {
    				var tabConainer = document.createElement('div');
    				tabConainer.id = 'tab';
    				tabConainer.setAttribute('class', 'tab');
    				attFillingResult.appendChild(tabConainer);
    			}

    			var tabHeader = document.createElement('button');
    			tabHeader.setAttribute('class', 'tablinks')
    			tabHeader.textContent = titleText;
    			tabHeader.id = title+'_header';
    			tabHeader.addEventListener('click', function(e) {openTab(e, title)});
    			tabConainer.appendChild(tabHeader);

    			var tabBody = document.createElement('div');
    			tabBody.id = title;
    			tabBody.setAttribute('class', 'tabcontent');
    			attFillingResult.appendChild(tabBody);

    			return tabBody;

    		},


    		renderBridgeATT: function(currentData, tabBody) {
    			// att.renderIterations(attFillingResult);
    			var that = this;
    			

    			var container = document.createElement('div');
    			container.innerHTML = '<table style="width:100%"><tr><th>Your Team</th><td id="teamInfoPH"></td><td rowspan="2" id="postButtonPH"></td></tr><tr><th>Iteration</th><td id="iterationPH"></td></tr><tr><td colspan="3"><div id="iteraionDetailContainer"><h6>Would you like to update the values like below? If "Yes" then please click the above "Submit" button. Thanks</h6><div id="iterationDetails"></div><div style="clear:both"><button class="attButton formButton" style="background-color:Darkorange;" id="cancelSubmit">Cancel</button>&nbsp;<button style="backgroud-color:DarkGreen" class="attButton formButton" id="confirmSubmit">Submit</button></div></td></tr><tr><th colspan="3" id="attUpdateResults"></th></tr></table>';

    			var errorContainer = document.createElement('p');
    			errorContainer.setAttribute('style', 'color:red;');

    			var formatCurrentData = att.formatData(currentData);

    			var formatSprintData = function(data) {
	    			var displaySprintData = [
	    			'storyPointsDelivered',	'committedStoryPoints',	'deliveredStories',	
	    			'committedStories', 'cycleTimeInBacklog', 'cycleTimeWIP', 
	    			'defectsClosed', 'defects'];
	    			var retData = {};

					// var template = '<table
					// style="width:100%"><tr><th>OLD</th><th>NEW</th></tr><tr><td>{old}</td><td>{new}</td></tr></table>'

	    			for (i=0;i<displaySprintData.length;i++) {
						
	    				retData[displaySprintData[i]+ " [ Existing # <span style=\"background-color:yellow\">"+data[displaySprintData[i]]+"</span> ]" ] = formatCurrentData[displaySprintData[i]];// +'
																																																	// &#8594;
																																																	// '+;
	    			}
	    			return retData;
    			}

    			var infoContainer = document.createElement('p');
    			infoContainer.setAttribute('style', 'color:blue;');
    			infoContainer.textContent = 'Please wait while I fetch your team and Iteration info from your ATT';
    			tabBody.appendChild(infoContainer);

    			att.getTeamInfo().then(function(team) {

    				att.getIterations(team['_id']).then(function(data){
    					tabBody.innerHTML='';
    					tabBody.appendChild(container);
    					document.getElementById('teamInfoPH').textContent=team['name'];

    					var selectElem = document.createElement('select');
    					var dataAssociated = {};
		            	for (i=data.length-1; i>0; i--) {
		            		// console.log(data[i]);
		            		var option = document.createElement("option");
		            		option.value = data[i]['_id'];
						    option.text = data[i]['name']+" ["+(new Date(data[i]['startDate'])).toDateString()+" - "+(new Date(data[i]['endDate'])).toDateString()+"]";
						    selectElem.appendChild(option);
						    dataAssociated[data[i]['_id']] = data[i];
		            	}

		            	
		            	var iterationDetails = that.createTableFromJSON([formatSprintData(data[data.length-1], formatCurrentData)], false, true);
		            	var iterationDetailsEl = document.getElementById('iterationDetails')
						iterationDetailsEl.appendChild(iterationDetails);
						// iterationDetailsEl.setAttribute('style',
						// 'display:none');

						var iteraionDetailContainerEl = document.getElementById('iteraionDetailContainer');
						iteraionDetailContainerEl.style.display='none';

		            	selectElem.addEventListener('change', function(e) {
		            		if ($('#iteration').val()) {
		            			var iterationDetails = that.createTableFromJSON([formatSprintData(dataAssociated[$('#iteration').val()], formatCurrentData)], false, true);
		            			iterationDetailsEl.innerHTML='';
		            			iterationDetailsEl.appendChild(iterationDetails);
								iteraionDetailContainerEl.style.display = 'none';
								// iterationDetailsConfEl.setAttribute('style',
								// 'display:none');
		    				}
		            	});

		            	selectElem.setAttribute('id', 'iteration');
		            	document.getElementById('iterationPH').appendChild(selectElem);

		            	var button = document.createElement('input');
		    			button.setAttribute('type', 'button');
		    			button.setAttribute('value', 'Update');
		    			button.setAttribute('style', 'height: 50px;width: 100%');
		    			
		    			button.setAttribute('class', 'attButton');

						button.addEventListener('click', function() {
							iteraionDetailContainerEl.style.display = 'block';
							// button.setAttribute('disabled', 'disabled');
							// iterationDetailsConfEl.style.display = 'block';
							// button.style.display='none';

						});

						var buttonCancel = document.getElementById('cancelSubmit');
						buttonCancel.addEventListener('click', function() {
							button.removeAttribute('disabled');
							iteraionDetailContainerEl.style.display = 'none';
							// iterationDetailsConfEl.style.display = 'none';

						});

						var buttonConf = document.getElementById('confirmSubmit');
		    			buttonConf.addEventListener('click', function(){

		    				if ($('#iteration').val()) {
								
		    					// var
								// currentData=dataAssociated[$('#iteration').val()];
		    					/*
								 * currentData['defects'] = 0;
								 * currentData['storyPointsDelivered']=11;
								 * currentData['deliveredStories'] = 3;
								 * currentData['cycleTimeInBacklog'] = 13;
								 * currentData['cycleTimeWIP'] = 9.7
								 * currentData['defectsClosed'] = 2;
								 */


		    					infoContainer.textContent='Please wait while I sync the data with ATT';
		    					tabBody.appendChild(infoContainer);
		    					

		    					att.setIteration($('#iteration').val(), currentData).then(function(){
		    						infoContainer.textContent = 'Successfully updated the ATT';
		    						tabBody.appendChild(infoContainer);
		    						that.renderBridgeATT(currentData, tabBody);
		    						button.removeAttribute('disabled');
									iteraionDetailContainerEl.style.display = 'none';

		    					}).catch(function(){
		    						errorContainer.textContent = 'Unable to update your ATT Iteration';
    								tabBody.appendChild(errorContainer);
    								button.removeAttribute('disabled');
		    					});	
		    				} else {
		    					that.setMessage('Please select an Iteration! and click "Update" button', true);
		    				}

		    			});
		    			document.getElementById('postButtonPH').appendChild(button);

    				}).catch(function(){

    					errorContainer.textContent = 'Unable to get your ATT Iterations';
    					tabBody.appendChild(errorContainer);

    				})

    			}).catch(function() {
					errorContainer.textContent = 'Unable to get your ATT Team Info';
					tabBody.appendChild(errorContainer);

    			})
    		},


    		

			setMessage: function(str, errorString) {

				var ptag = document.createElement('p');
				if (errorString) {
					ptag.setAttribute('style', 'color:red;');
				}
				ptag.textContent = str;
				attLogMessage.insertBefore(ptag, attLogMessage.childNodes[0]); 
				// attLogMessage.appendChild(ptag);
			},

		}


	};


	function initATT(){
		console.log(window.location.toString().indexOf(config.attURL) );
		if (window.location.toString().indexOf(config.attURL) < 0) {
			return;
		}



		var textelem = document.createElement('input'); 
		textelem.setAttribute('type', 'text'); 
		textelem.setAttribute('style', 'width:70%; height: 10px'); 
		document.body.insertBefore(textelem, document.body.childNodes[0]); 

		var button = document.createElement('button');
		button.textContent = 'Execute'; 
		button.setAttribute('class', 'attButton');

		document.body.insertBefore(button, document.body.childNodes[0]); 

		button.addEventListener('click', function() {
			var iterationDetails = '';
			var chosenIteration = document.getElementById('iteration-name').textContent;
			console.log(chosenIteration);
			var homeIterSelection = document.getElementById('homeIterSelection');
			for (i=0; i<homeIterSelection.options.length; i++) {
				if (homeIterSelection.options[i].textContent.indexOf(chosenIteration) >= 0) {
					iterationDetails = homeIterSelection.options[i].value;
					break;
				}
			}

			// var iterationDetails = $("#iterationSelectList
			// option:selected").val();
			if (!iterationDetails) {
				alert('Please select an Iteration!');
				return;
			}
			

			textelem.focus(); 
			textelem.setSelectionRange(0, textelem.value.length);
			console.log(textelem.value);
			eval('var currentData = '+textelem.value);


			var data = {};
			var url = 'https://agiletool.mybluemix.net/api/iteration/'+iterationDetails;

			var sprintData = $sprintData
			sprintData['defectsClosed'] = 0;
			sprintData['defectsStartBal'] = 0;
			sprintData['defectsEndBal'] = 0;

			
			var mapping = {
				'commStories' : 'committedStories',
				'commStoriesDel': 'deliveredStories', 
				'commPoints' : 'committedStoryPoints', 
				'commPointsDel' : 'storyPointsDelivered', 
			}

		
			for (e in currentData) {
				// if (document.getElementById(e)) {
				var index = (e in mapping)?mapping[e]:e;
				data[index] = currentData[e];
				// }
			}

			data['_id'] = iterationDetails;
			// data['teamId'] = teamDetails;

			console.log(data);

			var r = confirm("You are about to update the Iteration "+chosenIteration+'! with the following content. \n '+JSON.stringify(data)+' \n Click Ok to confirm.');
			if (r == true) {
				$.ajax({
	                url: url,
	                type: 'PUT',
	                dataType: 'json',
	                data: data,
	                success: function (data, textStatus, xhr) {
	                    console.log(data);
	                    // alert('successfully updated! Click Ok to refresh the
						// screen!');
	                    location.reload();
	                },
	                error: function (xhr, textStatus, errorThrown) {
	                    console.log('Error in Operation');
	                }
	            });
			} else {
			    
			}


			 


			// document.execCommand('paste');
		});

	};



	function makeRequestPost(url, param) {
		clearSprintData()
		if (!httpRequest) {
			modalHelper.setMessage('Giving up :( Cannot create an XMLHTTP instance', true);
		  	return false;
		}

		

		modalHelper.setMessage('Parsing the RTC query');
		httpRequest.onreadystatechange = parseQuery;
		httpRequest.open('POST', url);
		httpRequest.setRequestHeader("accept", "text/json");
		httpRequest.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
		httpRequest.send(param);

	}
	

	function makeRequestWithPromise(url, id, index) {
		return new Promise(function(resolve, reject) {
			var httpRequest = new XMLHttpRequest();;
	        httpRequest.open("GET", url);
	        httpRequest.onload = function() {
	            if (httpRequest.status === 200) {
	                resolve({id:id, index:index, data:JSON.parse(httpRequest.response)});
	            } else {
	                reject(new Error(httpRequest.statusText));
	            }
	        };
	 
	        httpRequest.onerror = function() {
	            reject(new Error("Network error"));
	        };
	 		httpRequest.setRequestHeader("accept", "text/json");
	        httpRequest.send();
	    });
	}
	
	function getHistoryQuery($itemId, $index) {
		modalHelper.setMessage('Querying the history of #'+$itemId);
		var $linkLocation = config.rtcURL+config.servicePath+config.getHistoryURL;
    	$linkLocation = $linkLocation.replace('{itemId}', $itemId);
    	return makeRequestWithPromise($linkLocation, $itemId, $index);
	}
	
	
	function getTopParent($itemId, $index) {
		modalHelper.setMessage('Looking into the links section of #'+$itemId);
		var $linkLocation = config.rtcURL+ config.servicePath +config.getLinksURL;
    	$linkLocation = $linkLocation.replace('{itemId}', $itemId);
    	return makeRequestWithPromise($linkLocation, $itemId, $index);

	}

	function getParent($itemId, $index) {
		modalHelper.setMessage('Looking into the links section of #'+$itemId);
		var $linkLocation = config.rtcURL+ config.servicePath +config.getLinksURL;
    	$linkLocation = $linkLocation.replace('{itemId}', $itemId);
    	return makeRequestWithPromise($linkLocation, $itemId, $index);

	}

	function dateDiff($date1, $date2) {

		var date1 = new Date($date1);
		var date2 = new Date($date2);
		// modalHelper.setMessage($date1, $date2);
		var timeDiff = Math.abs(date2.getTime() - date1.getTime());
		// modalHelper.setMessage(timeDiff);
		return Math.ceil(timeDiff / (1000 * 3600 * 24)); 

	}
	
	function dateDiffOnlyWeekday($date1, $date2) { 
		var date1 = new Date($date1);
		var date2 = new Date($date2);
	    delta = (date2 - date1) / (1000 * 60 * 60 * 24) + 1; 
	 
	    weekEnds = 0; 
	    for(i = 0; i < delta; i++) 
	    { 
	        if(date1.getDay() == 0 || date1.getDay() == 6) weekEnds ++; 
	        date1 = date1.valueOf(); 
	        date1 += 1000 * 60 * 60 * 24; 
	        date1 = new Date(date1); 
	    } 
	    console.log(Math.ceil(delta - weekEnds));
	    return Math.ceil(delta - weekEnds);  
	} 

	function RTCQuery($items) {

		this.$defectsArr = [];
		this.$sprintData = $sprintData;
		this.$historyArr = [];

		var $headers 
			= ($items['soapenv:Body']['response']['returnValue']['value']['headers'])?
        	$items['soapenv:Body']['response']['returnValue']['value']['headers']: [];
        
        var $headersArr = [];
        $headers.forEach(function(item, index){
        	$headersArr[index] = item['attributeId'];
        })
        // console.log($headersArr);
        var $rows = $items["soapenv:Body"].response.returnValue.value.rows;
        modalHelper.setMessage('Processing '+$rows.length+' records');
        this.setDefectsArray($headersArr, $rows);
        // console.log(this.$sprintData);
        this.processStories();
        

	}
	
	RTCQuery.prototype.processLinksAndHistories = function() {

		if (this.$defectsArr.length > 0) {

        	if (this.$historyArr.length == 0) {
        		this.summarize();
        		return;
        	}
        	var that = this;
        	Promise.all(this.$historyArr).then(function($itemsFull) {
        		console.log($itemsFull);
        		var $parentArray = [];
			  	for ($indexOfItem in $itemsFull) {
			  		var $items = $itemsFull[$indexOfItem];
			  		$parentArray.push(that.processWIP($items));
			  	}

			  	Promise.all($parentArray).then(function($parentValues) {
			  		// console.log($parentValues);
			  		var $parentsHistory = [];
			  		console.log($itemsFull);
			  		for ($link in $parentValues) {
			  			if ($parentValues[$link] === true) {
			  				$parentsHistory.push(that.processParentLinks($itemsFull[$link]));
			  			} else if ('index' in $parentValues[$link]) {
			  				$parentsHistory.push(that.processParentLinks($parentValues[$link]));
			  			}
			  		}

			  		Promise.all($parentsHistory).then(function($itemsParents) {
		  				
		  				var $parentBLArr = [];
		  				for ($indexOfItem in $itemsParents) {
		  					if (typeof $itemsParents[$indexOfItem] == 'object') {
	  							$parentBLArr.push(that.processParentHistory($itemsParents[$indexOfItem]));
	  						}
	  					}
	  					Promise.all($parentBLArr).then(function() {
	  						that.summarize();
	  					}).catch(function(reason) {
	  						modalHelper.setMessage(reason, true)
	  					});

			  		}).catch(function(reason){
			  			modalHelper.setMessage('Not able to find parent\'s history for...', true);
	  					modalHelper.setMessage(reason, true);
	  					console.log(reason);
			  		})

			  	}).catch(function(reason){
			  		modalHelper.setMessage('Not able to find parent for #'+$id, true);

			  		modalHelper.setMessage(reason, true)
			  	});
	            
			}).catch(function(reason) {
			  	modalHelper.setMessage(reason, true)
			});

        }

	}

	RTCQuery.prototype.processStories = function() {
		// console.log(this.$sprintData);
		var that = this;
    	this.$defectsArr.forEach(function($defect, $index) {
    		$id = $defect['id'];

    		if (typeof $id == 'undefined') {
    			return;
    		}

    		modalHelper.setMessage('Processing the work item '+$defect['workItemType']+' #'+$id);

    		if ($defect['workItemType'] == 'Story' 
            // || $defect['workItemType']=='Feature'
            ) {
                that.$sprintData['commStories']++;
            	var commPoints = parseInt($defect['com.ibm.team.apt.attribute.complexity']);
            	commPoints = !isNaN(commPoints)?commPoints:0;
                that.$sprintData['commPoints'] +=  commPoints;
                if ($defect['internalState'].indexOfR(config.workEndsAt, false) == -1) {
                    return;
                }
                that.$sprintData['commStoriesDel']++;
            	that.$sprintData['commPointsDel'] +=  commPoints;
                modalHelper.setMessage('Looking into the histry of work item #'+$id);
                that.$historyArr.push(getHistoryQuery($id, $index));

            } else {
            	/** defects * */

            	if (!config.defectsEnvVar || (config.defectsEnvVar in $defect 
            		&& $defect[config.defectsEnvVar].indexOfR(config.defectsEnv, false) != -1)
            	) {
                    that.$sprintData['defects']++;
                    if ($defect['internalState'].indexOfR(config.defectsClosed, false) != -1) {
                        that.$sprintData['defectsClosed']++;
                    }
                }

            }

    	});
	}

	RTCQuery.prototype.setDefectsArray = function($headersArr, $rows) {

		$defectsArr = [];    
        for (index in $rows) {
        	var item = $rows[index];
        	var $labels = item['labels'];
        	var $item   = {};
        	// modalHelper.setMessage($labels);
        	for (labelIndex in $labels) {
		        $item[$headersArr[labelIndex]] 
		        	= ('item' in item['info'][labelIndex]) 
		        	? item['info'][labelIndex]['item'][0]['comment']
		        	:$labels[labelIndex];  
        	}
        	$defectsArr.push($item);
        }
        this.$defectsArr = $defectsArr;
	}

	RTCQuery.prototype.processParentLinks = function(values) {
		
		modalHelper.setMessage('Parsing links of #'+values['id']);

		var $parentId = this.findParentID(values['data']);

		if (config.backlogWithStory == 'true' || (!$parentId && config.backlogWithStory == 'both')) {
			$parentId = values['id'];
			modalHelper.setMessage('Couldnt find parent of '+values['id']+'. Hence using the same id for calculating BL');
		} else {
			modalHelper.setMessage('Found the parent of '+values['id']+' as '+$parentId);
		}

    	
    	// modalHelper.setMessage('===='+$parentId);
    	if ($parentId) {
    		modalHelper.setMessage('Looking into the history of  parent #'+$parentId);
		  	return getHistoryQuery($parentId, values['index']);
		} else {
			// not able to find its parent.. it seems orphan / ticket
			this.$sprintData['commFeatures'].push(values['id']);
		}
		return true;
	}

	RTCQuery.prototype.processWIP = function($items) {
          
        $rows 
            = (($items['data']["soapenv:Body"]['response']['returnValue']['value']['changes']))?
            $items['data']['soapenv:Body']['response']['returnValue']['value']['changes']: 
            [];
        var $id = $items['id'];
        var $index = $items['index'];
        

        modalHelper.setMessage('Looking into history - finding WIP_start_date &  WIP_end_date for #'+$id);
        var that = this;  
        var earliestStartDate = new Date();
        var latestEndDate = 0;
        
        $rows.forEach(function($history, index) {
            // modalHelper.setMessage(JSON.stringify($history['content']));
            if ($history['content'].indexOfR(config.workStartsAt) > 0
            ) {
            	var curr = new Date($history['modifiedDate']);
            	if (earliestStartDate.getTime() >= curr.getTime()){
            		earliestStartDate = curr;
            		that.$defectsArr[$index]['WIP_start_date'] = $history['modifiedDate'];
            	}
                // modalHelper.setMessage('WIP_start_date'+$history['modifiedDate']);
            }

            if ($history['content'].indexOfR(config.workEndsAt) > 0
            ) {
            	var curr = new Date($history['modifiedDate']);
            	if (latestEndDate <= curr.getTime()){
            		latestEndDate = curr;
            		that.$defectsArr[$index]['WIP_end_date'] = $history['modifiedDate'];
            	}
                
                // modalHelper.setMessage('WIP_end_date'+$history['modifiedDate']);
            }

        });
        if (('WIP_end_date' in that.$defectsArr[$index]) 
            && ('WIP_start_date' in that.$defectsArr[$index])
        ) {
            modalHelper.setMessage('Successfully found WIP_start_date &  WIP_end_date for #'+$id);
            // modalHelper.setMessage(that.$defectsArr);

            // modalHelper.setMessage(that.$defectsArr[$id]['WIP_start_date'],
			// that.$defectsArr[$id]['WIP_end_date']);

            that.$defectsArr[$index]['WIP'] =  dateDiffOnlyWeekday(that.$defectsArr[$index]['WIP_start_date'], that.$defectsArr[$index]['WIP_end_date'])
            
            that.$sprintData['WIPTotal'] += that.$defectsArr[$index]['WIP'];

            modalHelper.setMessage('Finding the parent of '+$id);
        }

    }

	RTCQuery.prototype.processParentHistory = function($items) {
        modalHelper.setMessage('Finding BL_start_date & BL_end_date  of #'+$items['id']+' for the workitem #'+this.$defectsArr[$items['index']]);
        var $index = $items['index'];
        var $rows 
            = (($items['data']["soapenv:Body"]['response']['returnValue']['value']['changes']))?
            $items['data']['soapenv:Body']['response']['returnValue']['value']['changes']: 
            [];

        var that = this;
        // console.log($rows);
        $rows.forEach(function($history, index) {
        	modalHelper.setMessage('xxxxxx Finding the parent of '+$items['id']+ 'cccccc' + $history['modifiedDate']);
        	modalHelper.setMessage(JSON.stringify($history['content']));
        	if ($history['content'].indexOfR(config.backlogStartsAt) > 0
            	&& !('BL_start_date' in that.$defectsArr[$index])
            ) {
                that.$defectsArr[$index]['BL_start_date'] = $history['modifiedDate'];
            }

            if ($history['content'].indexOfR(config.backlogEndsAt) > 0
            	&& !('BL_end_date' in that.$defectsArr[$index])
            ) {
                that.$defectsArr[$index]['BL_end_date'] = $history['modifiedDate'];
            }

            

        });

        if (config.backlogStartsAtCreation == 'true' 
        	// && !('BL_start_date' in this.$defectsArr[$index])
        	|| (!('BL_start_date' in this.$defectsArr[$index]) && config.backlogStartsAtCreation == 'both')
        ) {
        	// console.log($rows[0]['modifiedDate']);
        	// console.log($items['id']);

        	that.$defectsArr[$index]['BL_start_date'] = $rows[0]['modifiedDate'];
        }

        if (('BL_start_date' in this.$defectsArr[$index]) 
            && ('BL_end_date' in this.$defectsArr[$index])
        ) {
            modalHelper.setMessage('Successfully found BL_start_date & BL_end_date  of parent #'+$items['id']);

            this.$defectsArr[$index]['BL'] =  dateDiffOnlyWeekday(this.$defectsArr[$index]['BL_start_date'], this.$defectsArr[$index]['BL_end_date']);
            
            this.$sprintData['BLTotal'] += this.$defectsArr[$index]['BL'];
            this.$sprintData['commFeatures'].push($items['id']);
        }
        return true;
    }

    RTCQuery.prototype.round = function(number, precision) {
	    var factor = Math.pow(10, precision);
	    var tempNumber = number * factor;
	    var roundedTempNumber = Math.round(tempNumber);
	    return roundedTempNumber / factor;
	}


	RTCQuery.prototype.summarize = function() {

		
		var totalFeatures = this.$sprintData['commFeatures'] = this.$sprintData['commFeatures'].filter(function(value, index, self){
			return self.indexOf(value) === index;
		})

		if (this.$sprintData['commStoriesDel'] > 0) {
            this.$sprintData['cycleTimeWIP'] 
                = this.round(this.$sprintData['WIPTotal']/this.$sprintData['commStoriesDel'], 1);
        }

        if (totalFeatures.length > 0) {
        	$sprintData['cycleTimeInBacklog'] 
                = this.round(this.$sprintData['BLTotal']/this.$sprintData['BLLength'], 1);
        }

        modalHelper.setMessage('All the records are successfully processed');
		
		rtcCache.set(queryId, 'sprintData', this.$sprintData);
		rtcCache.set(queryId, 'defectsArr', this.$defectsArr);

		this.renderResult();

	}

	RTCQuery.prototype.renderResult = function() {
		var res = new RenderResult(this.$sprintData, this.$defectsArr);
		res.render();
	}
	
	function parseQuery() {
		if (httpRequest.readyState === XMLHttpRequest.DONE) {
			if (httpRequest.status === 200) {
				modalHelper.setMessage('Got 200 OK response');
				if (httpRequest.responseText.indexOf('Loading...')>0) {
					modalHelper.setMessage('Please login to RTC and check again!', true);
					return;
				}
				var $items = JSON.parse(httpRequest.responseText);
				$rtc = new RTCQuery($items);
				$rtc.processLinksAndHistoriesSWCEnhance();
			} else {
				modalHelper.setMessage('There was a problem with the request.', true);
			}
		}
	}

// SWC Enhance start
	function makeSyncGetRequest(url, id) {
		var httpRequest = new XMLHttpRequest();;
        httpRequest.open("GET", url,false);
        httpRequest.setRequestHeader("accept", "text/json");
        httpRequest.send();
        if (httpRequest.status === 200) {
            return {id:id, data:JSON.parse(httpRequest.response)};
        } else {
            return new Error(httpRequest.statusText);
        }
	}
	
	function getHistoryQuerySync($itemId) {
		modalHelper.setMessage('Querying the history of #'+$itemId);
		var $linkLocation = config.rtcURL+config.servicePath+config.getHistoryURL;
    	$linkLocation = $linkLocation.replace('{itemId}', $itemId);
    	return makeSyncGetRequest($linkLocation, $itemId);
	}
	
	RTCQuery.prototype.processLinksAndHistoriesSWCEnhance = function() {

		if (this.$defectsArr.length > 0) {

        	if (this.$historyArr.length == 0) {
        		this.summarize();
        		return;
        	}
        	var that = this;
        	var $items, parent;
        	Promise.all(this.$historyArr).then(function($itemsFull) {
        		console.log($itemsFull);
			  	for ($indexOfItem in $itemsFull) {
			  		var $items = $itemsFull[$indexOfItem];
			  		that.processWIP($items)
			  		processIBL($items, findTopParentID($items, getCategory($items)));
			  	}
			  	that.summarize();
			}).catch(function(reason) {
			  	modalHelper.setMessage(reason, true)
			});
        	
        }

	}
	
	function getEearliestDate(items, identifier){
		var $rows 
        = ((items['data']["soapenv:Body"]['response']['returnValue']['value']['changes']))?
        		items['data']['soapenv:Body']['response']['returnValue']['value']['changes']:[];
        
        var earliestStartDate = new Date();
        var target;
       
	    $rows.forEach(function($history) {
	        if ($history['content'].indexOfR(identifier) > 0
	        ) {
	        	var curr = new Date($history['modifiedDate']);
	         	if (earliestStartDate.getTime() >= curr.getTime()){
	         		earliestStartDate = curr;
	         		target = $history['modifiedDate'];
	         	}
	        }
	    });

	    return target;
	}
	
	function processIBL($items, parent){
		modalHelper.setMessage('Finding BL_start_date & BL_end_date  of #'+$items['id']+' for the workitem #'+this.$defectsArr[$items['index']]);
		var $index = $items['index'];
        var blEnd = getEearliestDate($items, config.backlogEndsAt);
        var $rows 
        = ((parent['data']["soapenv:Body"]['response']['returnValue']['value']['changes']))?
        		parent['data']['soapenv:Body']['response']['returnValue']['value']['changes']:[];
        		
    	if (config.backlogStartsAtCreation == 'true' 
        	|| (!('BL_start_date' in this.$defectsArr[$index]) && config.backlogStartsAtCreation == 'both')
        ) {
    		this.$defectsArr[$index]['BL_start_date'] = $rows[0]['modifiedDate'];
        }
        if(typeof(blEnd)!="undefined"){
        	this.$defectsArr[$index]['BL_end_date'] = blEnd;
        }
        
        if (('BL_start_date' in this.$defectsArr[$index]) 
            && ('BL_end_date' in this.$defectsArr[$index])
        ) {
            modalHelper.setMessage('Successfully found BL_start_date & BL_end_date  of parent #'+$items['id']);

            this.$defectsArr[$index]['BL'] =  dateDiffOnlyWeekday(this.$defectsArr[$index]['BL_start_date'], this.$defectsArr[$index]['BL_end_date']);
            
            this.$defectsArr[$index]['parent'] = parent['id'];
            
            this.$sprintData['BLTotal'] += this.$defectsArr[$index]['BL'];
            this.$sprintData['commFeatures'].push(parent['id']);
            this.$sprintData['BLLength'] +=1;
        }
        return true;    
	}
	
	/**
	 * Find filed against
	 */
	function getCategory($items){
		var $rows 
        = (($items['data']['soapenv:Body']['response']['returnValue']['value']['attributes']))?
        $items['data']['soapenv:Body']['response']['returnValue']['value']['attributes']: 
        [];
        if ($rows.length > 0) {
	        for ($key in $rows) {
	        	var $value = $rows[$key];
	            if ($value.key == 'category') {
	            	return $value.value['label'];
	            }
	        }
	    }
	}
	
	function getWorkItemType($items){
		var $rows 
        = (($items['data']['soapenv:Body']['response']['returnValue']['value']['attributes']))?
        $items['data']['soapenv:Body']['response']['returnValue']['value']['attributes']: 
        [];
        if ($rows.length > 0) {
	        for ($key in $rows) {
	        	var $value = $rows[$key];
	            if ($value.key == 'workItemType') {
	            	return $value.value['label'];
	            }
	        }
	    }
	}
	
	/**
	 * no parent find or parent's category != item's category or parent type not
	 * in list
	 * 
	 * return current item.
	 * 
	 * else recursive in to find parent.
	 */
	function findTopParentID(currItem, childCategory){
		var parentId = findParentID(currItem);
		if (parentId == 0){
			return currItem;
		}
		var parentItem = getHistoryQuerySync(parentId);
		var parentCategory;
		
		if (config.ConsiderSameSquad == 'true'){
			parentCategory = getCategory(parentItem);
		}else{
			parentCategory = childCategory;
		}
	
		if(!(parentCategory == childCategory)
				|| config.backlogParentType.indexOf(getWorkItemType(parentItem)) == -1){
			return currItem;
		}else{
			return findTopParentID(parentItem, parentCategory);
		}
	}
	
	function findParentID($items){
		var b = $items['data']['soapenv:Body']
		console.log(b);
		var $rows 
        = (($items['data']['soapenv:Body']['response']['returnValue']['value']['linkTypes']))?
        $items['data']['soapenv:Body']['response']['returnValue']['value']['linkTypes']: 
        [];
	    var $parentId = 0;
	    if ($rows.length > 0) {
	        for ($key in $rows) {
	        	var $value = $rows[$key];
	            if ($value['displayName'] == 'Parent') {
	            	$linkItems = $value['linkDTOs'][0];
            		for (i=0; i<$linkItems['target']['attributes'].length; i++) {
            			if ($linkItems['target']['attributes'][i]['key'] == 'id') {
            				$parentId = $linkItems['target']['attributes'][i]['value']['id'];
            				return $parentId;
            			}
            		}		
	            }
	        }
	    }
	    return $parentId;
	}
// SWC Enhance end;
})();
