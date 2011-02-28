var dayStart = getDayStart(); // Midnight on the current day
var dayEnd = getDayEnd(); // 23:59:59:999 on the current day
var DAY_DURATION = 86400000; //number of milliseconds in a day

google.load("gdata", "1");
google.setOnLoadCallback(function(){
  getCalFeed(dayStart, dayEnd);
  updateHeader(dayStart);
}); //get the initial calendar on-load

//Set up a timed service to update the calendar every 15 minutes
$(document).ready(function(){  
  $(document).everyTime("900s", function(){
    dayStart = getDayStart();
    dayEnd = getDayEnd();
    getCalFeed(dayStart, dayEnd);
    updateHeader(dayStart);
  });
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
function getCalFeed(dayStart, dayEnd) {
  if (service == null){
    setupService();
  }
  
  var query = new google.gdata.calendar.CalendarEventQuery(feedUrl);
  var startDateMin = new google.gdata.DateTime(dayStart);
  var startDateMax = new google.gdata.DateTime(dayEnd);
    
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
      
    //Append a row for each event
    for (var i = 0; i < events.length; i++){
      var status = events[i].getEventStatus();
      var isCancelled = typeof status != 'undefined' && status.value == google.gdata.EventStatus.VALUE_CANCELED;
      var times = events[i].getTimes()[0];
      var displayTime;      
      
      // If instances of reoccuring events are cancelled, their times are undefined
      // Cancelled events have
      if (typeof times != 'undefined' && !isCancelled){
        var startTime = times.getStartTime().getDate();
        var endTime = times.getEndTime().getDate();
        displayTime = formatDisplay(startTime, endTime, dayStart, dayEnd);
        rowContent = "<tr><td>" + displayTime + "</td><td>" + events[i].getTitle().getText() + "</td></tr>";
        tbody.append(rowContent);
      }      
    }
  } 
}

var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

// Set the table header to the given date
function updateHeader(date){
  var displayDate = date.getDate() + " " + months[date.getMonth()] + ", " + date.getFullYear();
  $("th#header").text(displayDate);
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
  // For events lasting exactly one day, just display the date
  } else if(end.getTime() - start.getTime() == DAY_DURATION){  
    return formatDate(start);
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

// Given a Date, format it for table display
function formatDate(date){
  return date.getDate() + " " + months[date.getMonth()]
}

// Output an alert for the given error
function handleError(e) {
  alert("There was an error!");
  alert(e.cause ? e.cause.statusText : e.message);
}
