// File uploading code from: http://www.dotnetobject.com/Thread-Uploading-file-with-Javascript-and-XMLHTTPRequest
function fileSelected() {
	var file = document.getElementById('FileToUpload').files[0];
	if (file) {
		var fileSize = 0;
		if (file.size > 1024 * 1024)
			fileSize = (Math.round(file.size * 100 / (1024 * 1024)) / 100).toString() + 'MB';
		else
			fileSize = (Math.round(file.size * 100 / 1024) / 100).toString() + 'KB';

		document.getElementById('fileName').innerHTML = 'Name: ' + file.name;
		document.getElementById('fileSize').innerHTML = 'Size: ' + fileSize;
		document.getElementById('fileType').innerHTML = 'Type: ' + file.type;
		return file.name;
	}
}

function uploadFile(an, info) {
	var fd = new FormData();
	fd.append("FileToUpload", document.getElementById('FileToUpload').files[0]);
	var xhr = new XMLHttpRequest();
	xhr.upload.addEventListener("progress", uploadProgress, false);
	xhr.addEventListener("load", uploadComplete.bind(null, info), false);
	xhr.addEventListener("error", uploadFailed.bind(null, info), false);
	xhr.addEventListener("abort", uploadCanceled.bind(null, info), false);
	xhr.open("POST", $('#RESTAPI').html()+'/Requests.svc/' + an + '/media/');
	xhr.send(fd);
}

function uploadProgress(evt) {
	if (evt.lengthComputable) {
		var percentComplete = Math.round(evt.loaded * 100 / evt.total);
		document.getElementById('progressNumber').innerHTML = percentComplete.toString() + '%';
		document.getElementById('prog').value = percentComplete;
	}
	else {
		document.getElementById('progressNumber').innerHTML = 'unable to compute';
	}
}

function uploadComplete(a, evt) { // Server sent back a response
	console.log(evt)
	console.log(a)
	console.log(this)
	if ((evt.currentTarget.readyState == 4)&&(evt.currentTarget.status >= 200)&&(evt.currentTarget.status < 300)) // Image submission was successful
		document.body.innerHTML = '<p style="text-align: center; color: black;"><span style="text-align: center; font-size:1.1em;">Thank you for your submission.<br><br> Reference Number: ' + a[0] + '<br> First Name: ' + a[1] + '<br> Last Name: ' + a[2] + ' <br> Email: ' + a[3] + a[4] + '<br>File Name:' + a[5] + '<br><br><br>Additional Options:<br><a class="btn btn-default" href="' + top.MAINURL + '">Add Another</a><br><br><a class="btn btn-default" href="' + top.TRACKURL + '">Track this submission</a></span></p>';
	else // Image submission was unsuccessful 
		document.body.innerHTML = '<p style="text-align: center; color: black;"><span style="text-align: center; font-size:1.1em;">Thank you for your submission.<br><br> Reference Number: ' + a[0] + '<br> First Name: ' + a[1] + '<br> Last Name: ' + a[2] + ' <br> Email: ' + a[3] + a[4] + '<br>IMAGE UPLOAD FAILED. REQUEST SUCCESSFULLY SENT WITH NO IMAGE.<br><br><br>Additional Options:<br><a class="btn btn-default" href="' + top.MAINURL + '">Add Another</a><br><br><a class="btn btn-default" href="' + top.TRACKURL + '">Track this submission</a></span></p>';
	$(document).scrollTop(0);
}

function uploadFailed(a, evt) {
	document.body.innerHTML = '<p style="text-align: center; color: black;"><span style="text-align: center; font-size:1.1em;">Thank you for your submission.<br><br> Reference Number: ' + a[0] + '<br> First Name: ' + a[1] + '<br> Last Name: ' + a[2] + ' <br> Email: ' + a[3] + a[4] + '<br>IMAGE UPLOAD FAILED. REQUEST SUCCESSFULLY SENT WITH NO IMAGE.<br><br><br>Additional Options:<br><a class="btn btn-default" href="' + top.MAINURL + '">Add Another</a><br><br><a class="btn btn-default" href="' + top.TRACKURL + '">Track this submission</a></span></p>';
	$(document).scrollTop(0);
}

function uploadCanceled(a, evt) {
	document.body.innerHTML = '<p style="text-align: center; color: black;"><span style="text-align: center; font-size:1.1em;">Thank you for your submission.<br><br> Reference Number: ' + a[0] + '<br> First Name: ' + a[1] + '<br> Last Name: ' + a[2] + ' <br> Email: ' + a[3] + a[4] + '<br>IMAGE UPLOAD FAILED. REQUEST SUCCESSFULLY SENT WITH NO IMAGE.<br><br><br>Additional Options:<br><a class="btn btn-default" href="' + top.MAINURL + '">Add Another</a><br><br><a class="btn btn-default" href="' + top.TRACKURL + '">Track this submission</a></span></p>';
	$(document).scrollTop(0);
}