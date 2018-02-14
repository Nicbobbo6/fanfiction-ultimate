RetrieveStory();

function fetchPage(callback, url, chapter) {
    //Update display percentage
    resultDiv.innerHTML = "<center> Loading Chapter " + (chapter + 1) + " of " + (storyChapters.length) + "...</center>";

    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function(data) {
            if (xhr.readyState == 4) {
                if (xhr.status == 200) {
                    var data = xhr.responseText;
                    callback(data, chapter);
                } else {
                    callback(null, chapter);
                }
            }
        }
        // Note that any URL fetched here must be matched by a permission in
        // the manifest.json file!
    xhr.open('GET', url, true);
    xhr.send();
};

var storyChapters;
var completedChapters = 0;
var resultDiv;
var scratchDiv;
var targetLocation;


function SelectStoryText() {
    var sel = window.getSelection();
    var range = document.createRange();
    range.selectNodeContents(document.getElementByID("FullStoryShadingDiv"));
    sel.removeAllRanges();
    sel.addRange(range);
}
/* 
    get a selection of text from the window
    create a range in the document
    everything in that range is contents of FullStoryShadingDiv
    remove anything selected in the window
    adds range object to selection
*/

function RetrieveStory() {
    /* creating HTML-like code */
    var shadingDiv = document.createElement('div');
    resultDiv = document.createElement('div');
    scratchDiv = document.createElement('div');
    resultDiv.setAttribute('id', 'FullStoryResultDiv');
    shadingDiv.setAttribute('id', 'FullStoryShadingDiv');

    /* create a style tag using JavaScript */
    var head = document.getElementsByTagName('head')[0];
    var style = document.createElement('link'); /* defines the link to a CSS file */

    style.rel = 'stylesheet';
    style.type = 'text/css';
    style.href = 'css/main.css';
    console.log(style);

    head.appendChild(style);


    /* FullStoryResultDiv */
    resultDiv.style.cssText = [
        'background-color: white;',
        'color: black;',
        'margin: 0',
        'font: 13px Verdana;',
        'z-index: 2;',
        'position: absolute;',
        'top: 267px;',
        'left: 0px;',
        'right: 0px;',
        'width:  100%;',
        'padding: 0px 0.5em;',
        'align: center;',
        'word-wrap: break-word;'

    ].join(' ');

    /* FullStoryShadingDiv */
    shadingDiv.style.cssText = [
        'background-color: black;',
        'margin: 0;',
        'z-index: 1;',
        'position:absolute;',
        'top: 0px;',
        'left: 0px;',
        'right: 0px;',
        'width: auto',
        'height: auto;',
        'opacity: 0.5;'

    ].join(' ');

    document.body.style.cssText = 'position: relative';
    document.body.parentElement.insertBefore(resultDiv, document.body);
    document.body.appendChild(shadingDiv);


    if (document.getElementById("storytextp") == null) {
        alert("No story on this page!");
    } 
    else {
        var chaptersDropdown = document.getElementsByName("chapter");
        var chapters = 1;

        if (chaptersDropdown.length != 0) {
            chapters = chaptersDropdown[0].options.length;
        }

        var tmpLocation = self.location.href.substring(self.location.href.indexOf("fanfiction.net/s/") + 17);
        tmpLocation = tmpLocation.substring(0, tmpLocation.indexOf("/"));
        targetLocation = "https://www.fanfiction.net/s/" + tmpLocation + "/t('.'t)";

        storyChapters = new Array(chapters);
        completedChapters = 0;
        fetchPage(ParseStoryContent, targetLocation.replace("t('.'t)", 1), 0);
    }
}

function FinishStory() {
    //Fanfiction has floating bars now, which obscure our content, so move them behind us
    var floatingBars = document.getElementsByClassName('lc-wrapper');
    for (i = 0; i < floatingBars.length; i++) {
        floatingBars[i].style.zIndex = 1;
    }

    //Add utilities to top of page
    var resultClose = document.createElement('a');
    resultClose.setAttribute('href', 'javascript:void(0);');
    resultClose.setAttribute('onclick', 'javascript:FullStoryResultDiv.style.display="none";FullStoryShadingDiv.style.display="none";');
    resultClose.appendChild(document.createTextNode("Chapter-by-chapter"));

    var resultSelectAll = document.createElement('a');
    resultSelectAll.setAttribute('href', 'javascript:void(0);');
    resultSelectAll.setAttribute('onclick', 'javascript: selection = window.getSelection();range = document.createRange();range.selectNodeContents(document.getElementById("FullStoryResultDiv"));selection.removeAllRanges();selection.addRange(range);');
    resultSelectAll.appendChild(document.createTextNode("Select All"));

    //Print looks funny
    var print = document.createElement('a');
    print.setAttribute('href', 'javascript:void(0);');
    print.setAttribute('onclick', 'document.body.innerHTML = FullStoryResultDiv.innerHTML; FullStoryResultDiv.parentNode.removeChild(FullStoryResultDiv); window.print();');
    print.appendChild(document.createTextNode("Save PDF"));

    resultDiv.appendChild(resultClose);
    resultDiv.innerHTML += "&nbsp;&nbsp;&nbsp;&nbsp;"
    resultDiv.appendChild(resultSelectAll);
    resultDiv.innerHTML += "&nbsp;&nbsp;&nbsp;&nbsp;"
    resultDiv.appendChild(print);
    resultDiv.innerHTML += "<br><br>";

    var title = document.title;

    if (title.indexOf("Chapter") != -1) {
        title = title.substring(0, title.indexOf("Chapter"));
    }

    /* Dear Cas - 59 chapters */
    /* var story = "<h1>" + title + " - " + storyChapters.length + " chapters</h1><br />"; */
    var story = "<h1>" + title + "</h1>";
    /* story += "<h2>" + storyChapters.length + " chapters</h2><br />"; */

    /* Chapter 1
    blah blah blah ...
    */
    for (var i = 0; i < storyChapters.length; i++) {
        story += "<br /><br /><h3>Chapter " + (i + 1) + " </h3><br /><br /><br /><br /><br />";
        story += storyChapters[i];
        story += "<br /><hr />";
    }

    resultDiv.innerHTML += story;
    resultDiv.innerHTML += "<br /><br /><center>-- Thank you for using FanfictionUltimate <3 --</center>";
}

function ParseStoryContent(story, chapter) {
    completedChapters += 1;

    if (!story) {
        storyChapters[chapter] = "";
        fetchPage(ParseStoryContent, targetLocation.replace("t('.'t)", completedChapters + 1), completedChapters);
    } 
    else {
        var root = document.implementation.createHTMLDocument();
        root.body.innerHTML = story;
        storyChapters[chapter] = root.getElementById("storytextp")
            .innerHTML;
        root = null;

        if (completedChapters >= storyChapters.length) {
            resultDiv.innerHTML = "";

            FinishStory();
        } 
        else {
            fetchPage(ParseStoryContent, targetLocation.replace("t('.'t)", completedChapters + 1), completedChapters);
        }
    }
}