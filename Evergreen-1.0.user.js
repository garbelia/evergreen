// ==UserScript==
// @name         Evergreen
// @namespace    http://tampermonkey.net/
// @description  Full N-Day suite for Canopy
// @author       Garbelia
// @version      1.0
// @match        https://*.nationstates.net/page=blank/puppetsheet
// @match        https://*.nationstates.net/*
// @require      https://code.jquery.com/jquery-3.5.1.min.js
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_deleteValue
// @grant        window.close
// ==/UserScript==

let facID = GM_getValue('fid');
let targetID = GM_getValue('tfid');
let targetNations = GM_getValue('tfmult');
let selected = 0;
let table;
let nations;
let savedNations = GM_getValue('upNations');
if (savedNations) {
    let nations = JSON.parse(savedNations);
}
let targets;
let regexFindNumber = /\d+/g;

function nationNameToID(str) {
	if (!str) return "";
	return str.toLowerCase().trim().replace(/\s+/g, "_");
}

function onFac() {
    return window.location.href.includes('/page=facion/fid=' + facID);
}

function onSheet() {
    return window.location.href.includes('/page=blank/puppetsheet');
}

function onMassTarget() {
    return window.location.href.includes('/page=blank/masstarget');
}

function onTargetFac() {
    return window.location.href.includes('/page=facion/fid=' + targetID);
}

function onProd() {
    return window.location.href.includes("page=nukes/view=production") && (!window.location.href.includes("nation="));
}

function openBlank(url) {
    let a = document.createElement('a');
    a.target='_blank';
    a.href= url;
    a.click();
}

function fillTable(nations) {
    const currentNation = nationNameToID(nations[selected]);
    table.innerHTML = `<tr><td colspan=6 style="padding: 10px; text-align: center; border: 1px solid #1a5d49;"><a href="/container=` + currentNation + `/nation=` + currentNation + `/page=nukes?generated_by=evergreen_by_garbelia_used_by_` + nations[0] + `" target= "_blank">` + nations[selected] + ` (W)</a></td></tr>
    <tr><td style="padding: 10px; text-align: center; border: 1px solid #1a5d49;"><a href="/container=` + currentNation + `/nation=` + currentNation + `/page=nukes/view=production?generated_by=evergreen_by_garbelia_used_by_` + nations[0] + `" target= "_blank">Production (P)</a></td>
    <td style="padding: 10px; text-align: center; border: 1px solid #1a5d49;"><a href="/container=` + currentNation + `/page=faction/fid=` + targetID + `/view=nations?generated_by=evergreen_by_garbelia_used_by_` + nations[0] + `" target= "_blank">Target (T)</a></td>
    <td style="padding: 10px; text-align: center; border: 1px solid #1a5d49;"><a href="/container=` + currentNation + `/nation=` + currentNation + `/page=nukes/view=targets?generated_by=evergreen_by_garbelia_used_by_` + nations[0] + `" target= "_blank">Launch (L)</a></td>
    <td style="padding: 10px; text-align: center; border: 1px solid #1a5d49;"><a href="/container=` + currentNation + `/page=faction/fid=`+facID+`/view=incoming/?generated_by=evergreen_by_garbelia_used_by_` + nations[0] + `" target= "_blank">Incoming (M)</a>
    <td style="padding: 10px; text-align: center; border: 1px solid #1a5d49;"><a href="/container=` + currentNation + `/page=faction/fid=`+facID+`/view=nations/?generated_by=evergreen_by_garbelia_used_by_` + nations[0] + `" target= "_blank">Cleanup (C)</a></td>
    <td style="padding: 10px; text-align: center; border: 1px solid #1a5d49;"><a href="/container=` + currentNation + `/page=faction/fid=`+facID+`?consider_join_faction=1&join_faction=1?generated_by=evergreen_by_garbelia_used_by_` + nations[0] + `" target= "_blank"">Join (J)</a></td></tr>`;
};

(function () {
    if (onSheet()) {
        const content = document.querySelector('div#content');
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'text/plain';
        input.style.display = 'none';
        document.body.appendChild(input);

        const uploadButton = document.createElement('button');
        uploadButton.textContent = 'Upload Nation List';
        content.appendChild(uploadButton);

        const clearButton = document.createElement('button');
        clearButton.textContent = 'Clear Uploaded Nations';
        clearButton.addEventListener('click', function() {
            GM_deleteValue('upNations');
            table.innerHTML = '';
            count.innerHTML = 'Nations Loaded: 0';
        });
        content.appendChild(clearButton);

        const contButton = document.createElement('button');
        contButton.textContent = 'Download Containerise CSV';
        content.appendChild(contButton)

        contButton.addEventListener('click', function() {
            const savedLines = GM_getValue('upNations');
            if (!savedLines) {
                alert('Upload your nations file first!');
                return;
            }

            const nations = JSON.parse(savedLines);

            const output = nations.map(nation => {
                return '@^.*\.nationstates\.net/(.*/)?container=' + nationNameToID(nation) + '(/.*)?$, ' + nation;
            }).join('\n');

            const blob = new Blob([output], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'containerise(nations).csv';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        });

        const lineBreak = document.createElement('br');
        content.appendChild(lineBreak);

        const facIdInput = document.createElement('input');
        facIdInput.type = 'number';
        if ((GM_getValue("fid") != "")) {
            facIdInput.placeholder = GM_getValue("fid");
        }
        else {
            facIdInput.placeholder = "Insert Canopy's Faction ID:";
        }
        content.appendChild(facIdInput);

        const saveButton = document.createElement('button');
        saveButton.textContent = 'Save Canopy Faction ID';
        saveButton.addEventListener('click', function() {
            console.log("Clicked!");
            GM_setValue('fid', facIdInput.value);
        });
        content.appendChild(saveButton);

        const lineBreak2 = document.createElement('br');
        content.appendChild(lineBreak2);


        const targetIdInput = document.createElement('input');
        targetIdInput.type = 'number';
        if ((GM_getValue("tfid") != "")) {
            targetIdInput.placeholder = GM_getValue("tfid");
        }
        else {
            targetIdInput.placeholder = "Insert Target Faction's ID:";
        }
        content.appendChild(targetIdInput);

        const saveButton2 = document.createElement('button');
        saveButton2.textContent = 'Save Target Faction ID';
        saveButton2.addEventListener('click', function() {
            GM_setValue('tfid', targetIdInput.value);
        });
        content.appendChild(saveButton2);

        content.appendChild(document.createElement('br'));

        const targetMultInput = document.createElement('input');
        targetMultInput.type = 'number';
        if ((GM_getValue("tfmult") != "")) {
            targetMultInput.placeholder = GM_getValue("tfmult");
        }
        else {
            targetMultInput.placeholder = "Insert Number of Nations in Target Faction:";
        }
        content.appendChild(targetMultInput);
        console.log(GM_getValue("tfmult"));

        const saveButton3 = document.createElement('button');
        saveButton3.textContent = 'Save Target Faction Nation Number';
        saveButton3.addEventListener('click', function() {
            GM_setValue('tfmult', targetMultInput.value);
        });
        content.appendChild(saveButton3);

        content.appendChild(document.createElement('br'));

        const count = document.createElement('p');
        content.appendChild(count);

        function updateCount(nations) {
            count.innerHTML = 'Nations loaded: ' + nations.length;
        }

        const p = document.createElement('p');
        p.innerHTML = `<table style="padding: 5px; border: 1px solid #1a5d49;"><tr><td colspan=3><center>Keybinds <br>* = repeated several times for full action</center></td></tr>
        <tr><td>Keybind</td><td>Action on NationStates</td><td>Action on Puppet Sheet</td></tr>
        <tr style = "background-color: lightgrey;"><td>[R] </td><td colspan=2>Reload the page</td></tr>
        <tr style = "background-color: #white;"><td>[,] </td><td colspan=2>Go back</td></tr>
        <tr style = "background-color: lightgrey;"><td>[X] </td><td colspan=2>Close tab</td></tr>
        <tr style = "background-color: white;"><td>[H]</td><td>Go to the Puppet Sheet</td><td>Reload</td></tr>
        <tr style = "background-color: lightgrey;"><td>[1] </td><td>None</td><td>Select first loaded nation</td></tr>
        <tr style = "background-color: white;"><td>[Q] </td><td>None</td><td>Select previous loaded nation</td></tr>
        <tr style = "background-color: lightgrey;"><td>[W] </td><td>Go to your Nukes page</td><td>Open selected nation's Nukes page</td></tr>
        <tr style = "background-color: white;"><td>[E] </td><td>None</td><td>Select next loaded nation</td></tr>
        <tr style = "background-color: lightgrey;"><td>[P]</td><td>Convert production to nukes or shields based on specialty</td><td>Open selected nation's production page</td></tr>
        <tr style = "background-color: white;"><td>[A] </td><td>Convert production to nukes</td><td>Open selected nation's production page</td></tr>
        <tr style = "background-color: lightgrey;"><td>[S] </td><td>Convert production to shields</td><td>Open selected nation's production page</td></tr>
        <tr style = "background-color: white;"><td>[M*]</td><td>View and shield incoming nukes</td><td></td></tr>
        <tr style = "background-color: lightgrey;"><td>[T*]</td><td>Go to target faction's nation page, find target nation, target</td><td>Open target faction's nation page as selected nation</td></tr>
        <tr style = "background-color: white;"><td>[L*]</td><td>Launch nukes that are targetted</td><td>Open page to launch nukes as selected nation</td></tr>
        <tr style = "background-color: lightgrey;"><td>[C*] </td><td>Find nations to cleanup</td><td>Open own faction's nations page as selected nation</td></tr>
        <tr style = "background-color: white;"><td>[Spacebar]</td><td colspan=2>Open page logged in as the next puppet along your list (needs containers to be set up)</td></tr>
        <tr style = "background-color: lightgrey;"><td>[J] </td><td>Join faction</td><td>Join faction as selected nation</td></tr>
        <tr style = "background-color: white;"><td>[G*] </td><td colspan=2>Perform mass targeting using a csv file from the discord bot -- first press will open the Mass Targeting page. Upload the csv, then continue pressing G to cycle through targets and puppets</td></tr></table>
        `

        table = document.createElement('table');
        table.style.marginTop = '20px';
        table.style.border = '1px solid #1a5d49';
        content.appendChild(table);
        content.appendChild(p);



        uploadButton.addEventListener('click', function() {
              input.click();
        });
        input.addEventListener('change', function(event) {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const fileContents = e.target.result;
                    var nations = fileContents.split('\n');
                    nations = nations.filter(function(e){return e});
                    GM_setValue('upNations', JSON.stringify(nations));
                    updateCount(nations);
                    fillTable(nations);
                };
                reader.readAsText(file);
            }
        });
        if (savedNations) {
            const nations = JSON.parse(savedNations);
            console.log(nations);
            fillTable(nations);
            updateCount(nations);
        } else {
            count.innerHTML = 'Nations Loaded: 0';
        }
    } else if (window.location.href.includes("join_faction")) {
            var message = document.querySelector("p[class=info]");
            if (message != null) {
              window.close();
            }
    } else if (onMassTarget()) {
        const content = document.querySelector('div#content');
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.csv';
        input.style.display = 'none';
        document.body.appendChild(input);

        const uploadButton = document.createElement('button');
        uploadButton.textContent = 'Upload Mass Target CSV';
        content.appendChild(uploadButton);
        uploadButton.addEventListener('click', function() {
              input.click();
        });
        input.addEventListener('change', function(event) {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    var targets = new Array();
                    const fileContents = e.target.result;
                    fileContents.split("\n").forEach((value) => {
                        if (!value.length) return;
                        let [target2, multiplier] = value.split(",", 2);
                        let parsedMultiplier = parseFloat(multiplier);
                        if (isNaN(parsedMultiplier)) return;
                        targets.push(nationNameToID(target2));
                        targets.push(parsedMultiplier);
                        console.log(targets);

                    });
                    GM_setValue('upTargets', JSON.stringify(targets));
                    const p = document.createElement('p');
                    p.innerHTML = "Targets loaded. Press G repeatedly to move through them."
                    content.appendChild(p);
                };
                reader.readAsText(file);
            }
        });
    }
})();

$.fn.random = function() {
  return this.eq(Math.floor(Math.random() * this.length));
}
console.log("Reached Psi!");

(function() {
	var shifted = false;
	var controlled = false;
	var alternated = false;
	$(document).keydown(function(f) {
		shifted = f.shiftKey;
        controlled = f.ctrlKey;
		alternated = f.altKey;
		// Stops the spacebar from scrolling
		if (f.keyCode == 32 && f.target == document.body) {
			f.preventDefault();
			f.stopPropagation();
		}
	});
	// This is the main keymapping function of the script
	$(document).keyup(function(e) {
		// Psithurism will not activate while you are using the Shift, Ctrl, ot Alt keys
        if (shifted || controlled || alternated){
			return;
        }
        else if (onSheet()) {
             const nations = JSON.parse(GM_getValue('upNations'));
            			if ($("input,textarea").is(":focus")){
			// Psithurism will not activate if you are typing in a text field
				return;
			}
			// Go Back (<)
			else if (e.keyCode == 188) {
				window.history.back();
			}
			// Refresh (R)
			else if (e.keyCode == 82) {
				window.location.reload();
			}
			// Close (X)
			else if (e.keyCode == 88) {
				window.close();
			}
            // Select previous nation (Q)
            else if (e.keyCode == 81) {
                if (selected > 0) {
                    selected -= 1;
                    console.log(selected);
                    fillTable(nations);


                }
            }
            // Select next nation (E)
            else if (e.keyCode == 69) {
                if (selected < nations.length) {
                    selected += 1;
                    fillTable(nations);
                }
            }
            // Select first nation (1)
            else if (e.keyCode == 49) {
                selected = 0;
                console.log(selected);
                fillTable(nations);

            }
			// Go to Production Page (P)
			else if (e.keyCode == 80 || e.keyCode == 65 || e.keyCode == 83) {
                openBlank("/container=" + nationNameToID(nations[selected]) + "/page=nukes/view=production");
                console.log(selected);
                selected += 1;
                fillTable(nations);
            }
			// Go to Nukes Page (W)
			else if (e.keyCode == 87) {
                openBlank("/container=" + nationNameToID(nations[selected]) + "/page=nukes/");
                console.log(selected);
                selected += 1;
                fillTable(nations);
            }
			// Go to Incoming Page (M)
			else if (e.keyCode == 77) {
                openBlank("/container=" + nationNameToID(nations[selected]) + "/page=faction/fid="+facID+"/view=incoming/");
                console.log(selected);
                selected += 1;
                fillTable(nations);
            }
			// Go to Target Faction Page (T)
			else if (e.keyCode == 84) {
                openBlank("/container=" + nationNameToID(nations[selected]) + "/page=faction/fid=" + targetID + "/view=nations");
                console.log(selected);
                selected += 1;
                fillTable(nations);
            }
			// Go to Launch Page (L)
			else if (e.keyCode == 76) {
                openBlank("/container=" + nationNameToID(nations[selected]) + "/page=nukes/view=targets");
                console.log(selected);
                selected += 1;
                fillTable(nations);
            }
			// Go to Own Faction's Nations (C)
			else if (e.keyCode == 67) {
                openBlank("/container=" + nationNameToID(nations[selected]) + "/page/faction/fid=" + facID + "page=nations");
                console.log(selected);
                selected += 1;
                fillTable(nations);
            }
			// Join Faction (J)
			else if (e.keyCode == 74) {
                openBlank("/container=" + nationNameToID(nations[selected]) + "/page=faction/fid=" + facID + "?consider_join_faction=1&join_faction=1");
                console.log(selected);
                selected += 1;
                fillTable(nations);
            }
        }
		else {
			if ($("input,textarea").is(":focus")){
			// Psithurism will not activate if you are typing in a text field
				return;
			}
			// Go Back (<)
			else if (e.keyCode == 188) {
				window.history.back();
			}
			// Refresh (R)
			else if (e.keyCode == 82) {
				window.location.reload();
			}
			// Close (X)
			else if (e.keyCode == 88) {
				window.close();
			}
			// Convert Production (P, P)
			else if (e.keyCode == 80) {
				if (onProd()) {
					if ($('span.fancylike').text().indexOf("Military") > -1) {
						$('.button[name="convertproduction"][value^="nukes"]').first().trigger('click');
					}
					else if ($('span.fancylike').text().indexOf("Strategic") > -1) {
						$('.button[name="convertproduction"][value^="shield"]').first().trigger('click');
					}
					else if ($('span.fancylike').text().indexOf("Economic") > -1) {
						$('.button[name="convertproduction"][value^="nukes"]').first().trigger('click');
					}
					else if ($('span.fancylike').text().indexOf("Cleanup") > -1) {
						$('.button[name="convertproduction"][value^="shield"]').first().trigger('click');
					}
				}
				else {
					window.location.href = "/page=nukes/view=production";
				}
			}
			// Convert Production to Nukes (A, A)
			else if (e.keyCode == 65) {
				if (onProd()) {
					$('.button[name="convertproduction"][value^="nukes"]').first().trigger('click');
				}
				else {
					window.location.href = "/page=nukes/view=production";
				}
			}
			// Convert Production to Shields (S, S)
			else if (e.keyCode == 83) {
				if (onProd()) {
					$('.button[name="convertproduction"][value^="shield"]').first().trigger('click');
				}
				else {
					window.location.href = "/page=nukes/view=production";
				}
			}
			// Your Nuke Page (W)
			else if (e.keyCode == 87) {
					window.location.href = "/page=nukes";
			}
			// View and Shield Incoming (M, M)
			else if (e.keyCode == 77) {
				// if we're on the incoming nukes page
				if (window.location.href.indexOf("fid="+facID+"/view=incoming") > -1) {
					// shield a random incoming set in the list
					if ($('.button[name="defend"]').length > 0) {
						$('.button[name="defend"]').random().click();
						// any additional code if there's a captcha/additional choice?
					} else if ($('a[href*="view=incoming?start="]').length > 0) {
						$('a[href*="view=incoming?start="]')[0].click();
					}
					// reload the page to check for new incoming nukes
					else {
						window.location.href = "/page=faction/fid="+facID+"/view=incoming";
					}
				}
				// if we're not on the incoming nukes page
				else {
					window.location.href = "/page=faction/fid="+facID+"/view=incoming";
				}
			}
			// Perform Targetting (T, T, T, T)
			else if (e.keyCode == 84) {
				// if on the faction's list of nations, choose a random non-fully-irradiated nation
				if (onTargetFac() && window.location.href.indexOf("view=nations") > -1) {
					if ($('ol li:not(:has(.nukedestroyedicon)) a').length) {
						var linkToTarget = $('ol li:not(:has(.nukedestroyedicon)) a').random()[0].href;
						var regexFindNation = /(?<=nation=).*(?=\/page=nukes)/g;
						var nationToTarget = linkToTarget.match(regexFindNation)[0];
						window.location.href = "/nation="+nationToTarget+"/page=nukes?target="+nationToTarget;
					} else {
						$('a[href^="view=nations?start="]')[0].click();
					}
				}
				// if on the targetting page, calculate the appropriate number of nukes to target
				else if (window.location.href.indexOf("?target=") > -1 && window.location.href.indexOf("page=nukes") > -1) {
					var alreadyTargeted = parseInt($('.nukestat-targeted').text().match(regexFindNumber)[0]);
					var alreadyRads = parseInt($('.nukestat-radiation').text().match(regexFindNumber)[0]);
					var alreadyIncoming = parseInt($('.nukestat-incoming').text().match(regexFindNumber)[0]);
					var already = alreadyTargeted + 4*alreadyRads + alreadyIncoming;
					// if not enough are already targeted/rad/incoming at the nation, fire more, otherwise go back to the faction list
					if (already < 400 && $('.button[name="nukes"]').length > 0) {
						var minToTarget = 400 - already;
						var maxToTarget = minToTarget + 15;
						// choose the number of nukes within the right range
						$('.button[name="nukes"]').each(function(i) {
							var buttonValue = parseInt($(this).attr("value"));
							if (buttonValue <= maxToTarget) {
								var currentWindow = window.location.href;
								window.location.href = currentWindow + "&nukes=" + buttonValue;
								return false;
							}
						});
					}
					else {
						window.location.href = "/page=faction/fid=" + targetID + "/view=nations/start=" + Math.floor(Math.random() * targetNations);
					}
				}
                else {
                    window.location.href = "/page=faction/fid=" + targetID + "/view=nations/start=" + Math.floor(Math.random() * targetNations);
                    console.log("/page=faction/fid=" + targetID + "/view=nations/start=" + Math.floor(Math.random() * targetNations));
                }
			}
			// Launch Nukes (L, L, L)
			else if (e.keyCode == 76) {
				if (window.location.href.indexOf("view=targets") > -1 && window.location.href.indexOf("page=nukes") > -1 && (window.location.href.indexOf("nation="+$('body').attr('data-nname')) > -1 || window.location.href.indexOf("/nation=") <= -1)) {
					// launch the first set in the list
					if ($('.button[name="launch"]').length > 0) {
						$('.button[name="launch"]')[0].click();
					}
					else {
						window.location.reload();
					}
				}
				else {
					window.location.href = "/page=nukes/view=targets";
				}
			}
			// Go to Puppet Sheet (H)
			else if (e.keyCode == 72) {
				window.location.href = "/page=blank/puppetsheet";
			}
            // Open current page logged into the next nation along the list (Spacebar)
            // Must have containers set up using the csv provided, and all logged in
            else if (e.keyCode == 32) {
                let nations2 = nations.map((nationName) => nationNameToID(nationName));
                console.log(nations2);
                const currentNationID = nationNameToID($('body').attr('data-nname'));
                console.log(currentNationID);
                let cleanPath = window.location.pathname.replace(/^\/container=[^/]*/, '');
                const currentNationIndex = nations2.findIndex((element) => element === currentNationID);
                console.log(currentNationIndex);
                const nextNationID = nationNameToID(nations2.at(currentNationIndex + 1));
				window.location.href = "/container=" + nextNationID + cleanPath;
			}
            // Find destroyed nations in faction (C, C, C)
            else if (e.keyCode == 67) {
                if (onFac() && window.location.href.indexOf("page=nations") > -1) {
					if ($('ol li:has(.nukedestroyedicon)) a').length) {
						var linkToClean = $('ol li:has(.nukedestroyedicon)) a').random()[0].href;
						var regexFindCleanNation = /(?<=nation=).*(?=\/page=nukes)/g;
						var nationToClean = linkToClean.match(regexFindNation)[0];
						window.location.href = "/nation="+nationToTarget+ "/page=nukes";
					} else {
						$('a[href^="view=nations?start="]')[0].click();
					}
                 } else if (window.location.href.includes("page/nukes/view=radiation")){
                    document.querySelector("button[name='cureradiation']").click()                    
                 }
                 else {
                     window.location.href= "/page/faction/fid=" + facID + "page=nations";
                 }
            }
			// Join faction (J)
			else if (e.keyCode == 74) {
				window.location.href = "/page=faction/fid=" + facID + "?consider_join_faction=1&join_faction=1";
			}
            // Do mass targeting (G)
            else if (e.keyCode == 71) {
                let nations = JSON.parse(GM_getValue('upNations'));
                let targets = JSON.parse(GM_getValue('upTargets'));
                console.log(nations);
                console.log(targets);
                if (onMassTarget()) {
                    console.log(nations);
                    openBlank("/container="+nationNameToID(nations[0])+"/nation="+targets[0]+"/page=nukes?target="+targets[0]);
                }
                else if (window.location.href.includes("?target=") && window.location.href.includes("page=nukes") && window.location.href.includes(targets[0])) {
                    console.log("hewwo");
                    let nukesl = document.querySelectorAll('.nuketoken');
                    if (nukesl[1].textContent == "0 Nukes") {
                        let nations2 = nations.map((nationName) => nationNameToID(nationName));
                        console.log(nations2);
                        const currentNationID = nationNameToID($('body').attr('data-nname'));
                        console.log(currentNationID);
                        const currentNationIndex = nations2.findIndex((element) => element === currentNationID);
                        console.log(currentNationIndex);
                        const nextNationID = nationNameToID(nations2.at(currentNationIndex + 1));
                        window.location.href = "/container=" + nextNationID + "/nation="+targets[0]+"/page=nukes?target="+targets[0];
                    } else {
                        console.log("mr obama?");
                        console.log(nukesl[1].textContent);
                        var massAlreadyTargeted = parseInt($('.nukestat-targeted').text().match(regexFindNumber)[0]);
                        var massAlreadyRads = parseInt($('.nukestat-radiation').text().match(regexFindNumber)[0]);
                        var massAlreadyIncoming = parseInt($('.nukestat-incoming').text().match(regexFindNumber)[0]);
                        var massAlready = alreadyTargeted + 4*alreadyRads + alreadyIncoming;
                        // if not enough are already targeted/rad/incoming at the nation, fire more, otherwise go back to the faction list
                        if (already < 400*targets[1] && $('.button[name="nukes"]').length > 0) {
                            var massMinToTarget = 400*targets[1] - already;
                            var massMaxToTarget = minToTarget + 15;
                            // choose the number of nukes within the right range
                            $('.button[name="nukes"]').each(function(i) {
                                var buttonValue = parseInt($(this).attr("value"));
                                if (buttonValue <= maxToTarget) {
                                    var currentWindow = window.location.href;
                                    window.location.href = currentWindow + "&nukes=" + buttonValue;
                                    return false;
                                }
                            });
                        } else {
                            targets.splice(0,2);
                            window.location.href = "/nation="+targets[0]+"/page=nukes?target="+targets[0];
                        }
                    }
                } else {
                    console.log("awawawawa");
                    window.location.href = "/page=blank/masstarget";
                }
            }
		} //End of Else keylist
	}); // End of Keyup Function(e)
})(); //End of Main function