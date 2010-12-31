// Settings for Google Calendar authentication
function Settings() {
  this.email = "example@gmail.com"; //Your Google account's e-mail address
  /*
  this.key must be set to the private key string for your desired calendar. For example,
  
    http://www.google.com/calendar/feeds/example@gmail.com/private-COPY_THIS_PART_BELOW/basic
    
  this.key should be set to only the COPY_THIS_PART_BELOW portion.
  */
  this.key = "xxx";
}
