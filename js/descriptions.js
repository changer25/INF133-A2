let writtenTweets = [];
function parseTweets(runkeeper_tweets) {
	//Do not proceed if no tweets loaded
	if(runkeeper_tweets === undefined) {
		window.alert('No tweets returned');
		return;
	}

    let tweet_array = runkeeper_tweets.map(function(tweet) {
        return new Tweet(tweet.text, tweet.created_at);
    });

	//TODO: Filter to just the written tweets
	writtenTweets = tweet_array.filter(tweet => tweet.written);


}


function addEventHandlerForSearch() {
    const searchCount = document.getElementById('searchCount');
    const searchText = document.getElementById('searchText');
    const searchBox = document.getElementById('textFilter');
    const tweetTable = document.getElementById('tweetTable');
    let debounceTimeout;

    searchBox.addEventListener('input', function() {
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(() => {
            const searchTerm = searchBox.value.toLowerCase();
            searchText.textContent = searchTerm;

            const filteredTweets = filterTweets(writtenTweets, searchTerm);
            updateTweetTable(tweetTable, filteredTweets);

            searchCount.textContent = filteredTweets.length;
        }, 300); // Adjust debounce delay as needed
    });
}
function updateTweetTable(tableElement, tweets) {
    const fragment = document.createDocumentFragment(); // Create a document fragment

    // Create table rows and append to the fragment
    tweets.forEach((tweet, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = tweet.getHTMLTableRow(index + 1);
        fragment.appendChild(tr);
    });

    tableElement.innerHTML = ''; // Clear existing rows
    tableElement.appendChild(fragment); // Append all new rows at once
}

function filterTweets(tweets, searchTerm) {
    return tweets.filter(tweet => tweet.text.toLowerCase().includes(searchTerm));
}

//Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function (event) {
	addEventHandlerForSearch();
	loadSavedRunkeeperTweets().then(parseTweets);
});