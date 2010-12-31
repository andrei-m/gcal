google.load("gdata", "1");
google.setOnLoadCallback(getCalFeed); //get the initial calendar on-load

//Set up a timed service to update the calendar every 15 minutes
$(document).ready(function(){
  $(document).everyTime("900s", getCalFeed);
});

var settings = new Settings(); //from settings.js
var service = null; //the Google Calendar service
//The URL to the 'magic cookie' authenticated feed
var feedUrl = "http://www.google.com/calendar/feeds/" + settings.email + "/private-" + settings.key + "/full";

// Initialize the Google Calendar service
function setupService() {
  service = new google.gdata.calendar.CalendarService('exampleCo-exampleApp-1');
}

// Retrieve the private feed using the magic cookie URL
function getCalFeed() {
  if (service == null){
    setupService();
  }
  
  var query = new google.gdata.calendar.CalendarEventQuery(feedUrl);
  var startDateMin = new google.gdata.DateTime(getDayStart());
  var startDateMax = new google.gdata.DateTime(getDayEnd());
    
  //Query all of today's events, sorted by start time  
  query.setMinimumStartTime(startDateMin);
  query.setMaximumStartTime(startDateMax);
  query.setOrderBy('starttime');
  query.setSortOrder('ascending');
  
  service.getEventsFeed(query, handleFeed, handleError);
}

// Populate the page with an agenda from the given feed
function handleFeed(myResultsFeedRoot){
  resetTable();
  
  var events = myResultsFeedRoot.feed.getEntries();
  result = ""
  
  if (events.length > 0){
    var rowContent = "";
    var tbody = $("table#schedule > tbody:last");
    var dayEnd = getDayEnd();
    var dayStart = getDayStart();
      
    //Append a row for each event
    for (var i = 0; i < events.length; i++){
      var times = events[i].getTimes()[0];
      var startTime = times.getStartTime().getDate();
      var endTime = times.getEndTime().getDate();
      var displayTime = formatDisplay(startTime, endTime, dayStart, dayEnd);
      
      rowContent = "<tr><td>" + displayTime + "</td><td>" + events[i].getTitle().getText() + "</td></tr>";
      tbody.append(rowContent);
    }
  } 
}

// Remove all but the first row in the schedule table
function resetTable(){
  $("table#schedule > tbody:last").find("tr").remove();
}

// Returns a Date representing midnight today
function getDayStart(){
  var currentTime = new Date();
  currentTime.setHours(0);
  currentTime.setMinutes(0);
  currentTime.setSeconds(0);
  currentTime.setMilliseconds(0);
  return currentTime;
}

// Returns a Date representing 23:59:59 today
function getDayEnd(){
  var currentTime = new Date();  
  currentTime.setHours(23);
  currentTime.setMinutes(59);
  currentTime.setSeconds(59);
  currentTime.setMilliseconds(999);
  return currentTime;
}

// Returns a display string based on how the given start/end dates relate to beginning/end of day
function formatDisplay(start, end, dayStart, dayEnd){
  if (start.getTime() >= dayStart.getTime() && end.getTime() <= dayEnd.getTime()){
    return formatTime(start) + " - " + formatTime(end);
  } else if (start.getTime() < dayStart.getTime() && end.getTime() <= dayEnd.getTime()){
    return "... - " + formatTime(end);  
  } else if (start.getTime() >= dayStart.getTime() && end.getTime() > dayEnd.getTime()){
    return formatTime(start) + " - ...";
  } else {
    return "all day";
  }
}

// Given a Date, return a formatted time string for display
function formatTime(date){  
  // Pad the given number with a leading 0 if it is one digit long
  function pad(n){return n<10 ? '0'+n : n}
  return pad(date.getHours()) + ":" + pad(date.getMinutes());
}

// Output an alert for the given error
function handleError(e) {
  alert("There was an error!");
  alert(e.cause ? e.cause.statusText : e.message);
}
