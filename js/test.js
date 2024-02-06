function extractActionVerbsAndDistances(tweets) {
    let activities = {}; // Initialize an empty object for storing activity counts and total distances

    tweets.forEach(tweet => {
        const match = tweet.text.match(/Just completed a ([\d.]+) (km|mi) (\w+)/);
        if (match && match.length > 3) {
            const distance = parseFloat(match[1]);
            const unit = match[2];
            const activity = match[3].toLowerCase(); // Normalize the activity type to lowercase

            // Convert kilometers to miles if necessary
            const distanceInMiles = unit === 'km' ? distance * 0.621371 : distance;

            if (activities[activity]) {
                activities[activity].count += 1; // Increment the count
                activities[activity].totalDistance += distanceInMiles; // Add to the total distance
            } else {
                activities[activity] = { count: 1, totalDistance: distanceInMiles }; // Initialize if it's the first occurrence
            }
        }
    });

    // Convert the activities object to an array and sort it by count in descending order
    const sortedActivities = Object.entries(activities).sort((a, b) => b[1].count - a[1].count);

    // Take the top 3 activities
    const topActivities = sortedActivities.slice(0, 3);

    // Calculate the average distance for each of the top 3 activities
    topActivities.forEach(([activity, data]) => {
        const averageDistance = data.totalDistance / data.count;
        console.log(`${activity}: Average Distance = ${averageDistance.toFixed(2)} miles`);
    });
}

document.addEventListener('DOMContentLoaded', function (event) {
    loadSavedRunkeeperTweets().then(function(tweets) {
        extractActionVerbsAndDistances(tweets);
    });
});