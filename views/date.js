   exports.getDate = function(){
    
    const today = new Date();

    //const currDay=today.getDay();

    const options ={
        weekday:"long",
        day:"numeric",
        month:"long"
    };

    return today.toLocaleDateString("en-US",options);
}