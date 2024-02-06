function extractActionVerbsAndDistances(runkeeper_tweets) {
    let activities = {};

    const tweet_array = runkeeper_tweets.map(tweet => new Tweet(tweet.text, tweet.created_at));

    tweet_array.forEach(tweet => {
        const activity = tweet.activityType;
        const distance = tweet.distance;
        const dayOfWeek = tweet.time.getDay(); // 0 for Sunday, 1 for Monday, etc.

        if (activity !== "unknown") {
            if (!activities[activity]) {
                activities[activity] = {
                    count: 0,
                    totalDistance: 0,
                    days: { '0': 0, '1': 0, '2': 0, '3': 0, '4': 0, '5': 0, '6': 0 } // Initialize distances for each day
                };
            }

            activities[activity].count += 1;
            activities[activity].totalDistance += distance;
            if (!activities[activity].days[dayOfWeek]) {
                activities[activity].days[dayOfWeek] = 0;
            }
            activities[activity].days[dayOfWeek] += distance; // Add distance for specific day
        }
    });

    const sortedActivities = Object.entries(activities).sort((a, b) => b[1].count - a[1].count);
    console.log(sortedActivities);
    const numberActivities = Object.keys(sortedActivities).length;
    document.getElementById('numberActivities').textContent = numberActivities;
	const topThreeActivities = sortedActivities.slice(0, 3);

    let longestAverage = 0;
    let shortestAverage = Infinity;
    let longestActivityType = '';
    let shortestActivityType = '';

    let weekdayOrWeekendLonger = '';

    topThreeActivities.forEach(([activity, data]) => {
        const averageDistance = data.totalDistance / data.count;
        console.log(`${activity}: Average Distance = ${averageDistance.toFixed(2)} miles`);
        if (averageDistance > longestAverage) {
            longestAverage = averageDistance;
            longestActivityType = activity;

            const weekendAverage = data.weekendTotalDistance / data.weekendCount;
            const weekdayAverage = data.weekdayTotalDistance / data.weekdayCount;
            weekdayOrWeekendLonger = weekendAverage > weekdayAverage ? 'weekends' : 'weekdays';
        }

        if (averageDistance < shortestAverage) {
            shortestAverage = averageDistance;
            shortestActivityType = activity;
        }
    });


	// Take the top 3 activities
	const firstMost = topThreeActivities[0] ? topThreeActivities[0][0] : 'N/A'; // Default to 'N/A' if there's no activity
	const secondMost = topThreeActivities[1] ? topThreeActivities[1][0] : 'N/A'; // Default to 'N/A' if there's no second activity
	const thirdMost = topThreeActivities[2] ? topThreeActivities[2][0] : 'N/A'; // Default to 'N/A' if there's no third activity

	document.getElementById('firstMost').textContent = firstMost;
	document.getElementById('secondMost').textContent = secondMost;
	document.getElementById('thirdMost').textContent = thirdMost;

    // Return activities for further processing if needed
    return sortedActivities;

}

function prepareDataForPlot2And3(tweet_array) {
    // Object to hold the counts and accumulated distances for each activity type and day of the week
    let activityCounts = {};
    let activityDistancesByDay = {};
  
    tweet_array.forEach(tweet => {
      const activityType = tweet.activityType;
      const distance = tweet.distance;
  
      if (activityType === 'unknown' || distance === 0) {
        return;
      }
  
      // Count the occurrences of each activity type
      if (!activityCounts[activityType]) {
        activityCounts[activityType] = 0;
      }
      activityCounts[activityType]++;
  
      const dayOfWeek = tweet.time.toLocaleDateString('en-US', { weekday: 'long' });
  
      if (!activityDistancesByDay[activityType]) {
        activityDistancesByDay[activityType] = {};
      }
      if (!activityDistancesByDay[activityType][dayOfWeek]) {
        activityDistancesByDay[activityType][dayOfWeek] = [];
      }
      activityDistancesByDay[activityType][dayOfWeek].push(distance);
    });
  
    // Find the top three activities based on the count
    const topThreeActivities = Object.entries(activityCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(entry => entry[0]);
  
    // Filter the distances by day only for the top three activities
    let vegaLiteData = [];
    topThreeActivities.forEach(activityType => {
      const days = activityDistancesByDay[activityType];
      for (const [dayOfWeek, distances] of Object.entries(days)) {
        distances.forEach(distance => {
          vegaLiteData.push({
            activityType: activityType,
            dayOfWeek: dayOfWeek,
            distance: distance
          });
        });
      }
    });
  
    // Sort the data by activity type and day of the week
    vegaLiteData.sort((a, b) => a.activityType.localeCompare(b.activityType) || a.dayOfWeek.localeCompare(b.dayOfWeek));
    return vegaLiteData;
  }




function getActivitiesForPlot1(sortedActivities) {
    // Process all activities, not just the top three
    const allActivities = sortedActivities.map(([activity, data]) => {
        // Extract the necessary data for each activity
        return {
            activity: activity,
            count: data.count
        };
    });
    return allActivities;
}


function convertDayNumberToString(dayNumber) {
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return daysOfWeek[dayNumber] || dayNumber; 
}


function parseTweets(runkeeper_tweets) {
	//Do not proceed if no tweets loaded
	if(runkeeper_tweets === undefined) {
		window.alert('No tweets returned');
		return;
	}
	
	tweet_array = runkeeper_tweets.map(function(tweet) {
		return new Tweet(tweet.text, tweet.created_at);
	});

	//TODO: create a new array or manipulate tweet_array to create a graph of the number of tweets containing each type of activity.
	const activities = extractActionVerbsAndDistances(tweet_array);
    const activities2And3 = prepareDataForPlot2And3(tweet_array);
    const activitiesForPlot1 = getActivitiesForPlot1(activities);


    activity_vis_spec = {
        "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
        "description": "A graph of the number of Tweets containing each type of activity.",
        "data": {
            "values": activitiesForPlot1 
        },
        "mark": "point",
        "encoding": {
            "x": {
                "field": "activity", 
                "type": "nominal", 
                "axis": {"title": "Activity Type"}
                
            },
            "y": {
                "field": "count", 
                "type": "quantitative", 
                "axis": {"title": "Number of Activities"}
            }
        }
    };
    
   
    vegaEmbed('#activityVis', activity_vis_spec, {actions: false});

	//TODO: create the visualizations which group the three most-tweeted activities by the day of the week.
	//Use those visualizations to answer the questions about which activities tended to be longest and when.
    let individualPlotSpec = {
        "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
        "description": "Individual distances by day of the week for the three most tweeted-about activities",
        "data": {
          "values": activities2And3 
        },
        "mark": "point",
        "encoding": {
          "x": {"field": "dayOfWeek", "type": "ordinal", "title": "Day of the Week", "sort": ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]},
          "y": {"field": "distance", "type": "quantitative", "title": "Distance"},
          "color": {"field": "activityType", "type": "nominal", "title": "Activity Type"}
          
        }
      };
      
      let aggregatedPlotSpec = {
        "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
        "description": "Mean distances by day of the week for the three most tweeted-about activities",
        "data": {
          "values": activities2And3 
        },
        "mark": "point",
        "encoding": {
          "x": {"field": "dayOfWeek", "type": "ordinal", "title": "Day of the Week", "sort": ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]},
          "y": {
            "aggregate": "mean", 
            "field": "distance", 
            "type": "quantitative", 
            "title": "Mean Distance"
          },
          "color": {"field": "activityType", "type": "nominal", "title": "Activity Type"}
        }
      };
    

    vegaEmbed('#distanceVisAggregated', individualPlotSpec, {actions: false})
    vegaEmbed('#distanceVis', individualPlotSpec, {actions: false}).then(() => {
        // Initially hide the aggregated plot
        document.getElementById('distanceVisAggregated').style.display = 'none';
    });

    // Setup toggle functionality
    document.getElementById('aggregate').addEventListener('click', function() {
        var distanceVis = document.getElementById('distanceVis');
        var distanceVisAggregated = document.getElementById('distanceVisAggregated');

        // Toggle visibility
        distanceVis.style.display = distanceVis.style.display === 'none' ? 'block' : 'none';
        distanceVisAggregated.style.display = distanceVisAggregated.style.display === 'none' ? 'block' : 'none';

        // Update button text based on the visibility of the individual plot
        this.textContent = distanceVis.style.display === 'block' ? 'Show means' : 'Show individual distances';

        // Conditionally re-embed if necessary
        if (distanceVis.style.display === 'block') {
            vegaEmbed('#distanceVis', individualPlotSpec, {actions: false});
        } else {
            vegaEmbed('#distanceVisAggregated', aggregatedPlotSpec, {actions: false});
        }
    });
}


document.addEventListener('DOMContentLoaded', function() {
    loadSavedRunkeeperTweets().then(parseTweets); // Assuming this function sets up your plots initially

});