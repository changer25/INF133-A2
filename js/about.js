function parseTweets(runkeeper_tweets) {
    // Do not proceed if no tweets loaded
    if(runkeeper_tweets === undefined) {
        window.alert('No tweets returned');
        return;
    }

	// Create map with callback function to fill said map with tweet objects
    let tweet_array = runkeeper_tweets.map(function(tweet) {
        return new Tweet(tweet.text, tweet.created_at);
    });

    // Sort tweets by date
    tweet_array.sort(function(a, b) {
        return new Date(a.time) - new Date(b.time);
    });

    // Retrieve earliest and latest tweets
    let earliestTweet = tweet_array[0];
    let latestTweet = tweet_array[tweet_array.length - 1];

    // Format dates
    let earliestDate = earliestTweet.time.toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    let latestDate = latestTweet.time.toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

	    // Initialize counters for each category
		let completedEventsCount = 0, liveEventsCount = 0, achievementsCount = 0, miscellaneousCount = 0;

		// Categorize each tweet and update counters
		tweet_array.forEach(tweet => {
			switch (tweet.source) {
				case 'completed_event':
					completedEventsCount++;
					break;
				case 'live_event':
					liveEventsCount++;
					break;
				case 'achievement':
					achievementsCount++;
					break;
				default:
					miscellaneousCount++;
			}
		});


    // Update the DOM with tweet counts and date extreemes
    document.getElementById('numberTweets').innerText = tweet_array.length;
    document.getElementById('firstDate').innerText = earliestDate;
    document.getElementById('lastDate').innerText = latestDate;

    // Update the DOM with counts for each category
    document.querySelector('.completedEvents').innerText = completedEventsCount;
    document.querySelector('.liveEvents').innerText = liveEventsCount;
    document.querySelector('.achievements').innerText = achievementsCount;
    document.querySelector('.miscellaneous').innerText = miscellaneousCount;

    // Calculate and update percentages
    let totalTweets = tweet_array.length;
    document.querySelector('.completedEventsPct').innerText = ((completedEventsCount / totalTweets) * 100).toFixed(2) + '%';
    document.querySelector('.liveEventsPct').innerText = ((liveEventsCount / totalTweets) * 100).toFixed(2) + '%';
    document.querySelector('.achievementsPct').innerText = ((achievementsCount / totalTweets) * 100).toFixed(2) + '%';
    document.querySelector('.miscellaneousPct').innerText = ((miscellaneousCount / totalTweets) * 100).toFixed(2) + '%';
}

// Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function (event) {
    loadSavedRunkeeperTweets().then(parseTweets);
});