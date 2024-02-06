class Tweet {
	private text:string;
	time:Date;

	constructor(tweet_text:string, tweet_time:string) {
        this.text = tweet_text;
		this.time = new Date(tweet_time);//, "ddd MMM D HH:mm:ss Z YYYY"
	}

	//returns either 'live_event', 'achievement', 'completed_event', or 'miscellaneous'
    get source(): string {
        if (this.text.startsWith("Just completed") || this.text.includes("Check it out")) {
            return 'completed_event';
        } else if (this.text.includes("Live") || this.text.includes("right now")) {
            return 'live_event';
        } else if (this.text.includes("Achieved") || this.text.includes("New PB") || this.text.includes("record")) {
            return 'achievement';
        } else {
            return 'miscellaneous';
        }
    }

    //returns a boolean, whether the text includes any content written by the person tweeting.
    get written(): boolean {
        // Check if the tweet includes "Check it out!" or "Just completed a"
        return !((this.text.includes("Check it out!") || this.text.includes("TomTom MySports Watch")) && (this.text.includes("Just completed a") || this.text.includes("Just posted a")));
    }


    // returns the extracted text of tweet if it is written by a person
    get writtenText():string {
        if(!this.written) {
            return "";
        }

        return this.text;        

    }


    // returns the type of activitiy (given that it is a completed event)
    get activityType():string {
        if (this.source != 'completed_event') {
            return "unknown";
        }
        const match = this.text.match(/Just completed a [\d.]+ (km|mi) (\w+)/);
        return match ? match[2].toLowerCase() : "unknown";
 
    }

    
    // returns distance of completed activity completed
    get distance():number {
        if(this.source != 'completed_event') {
            return 0;
        }
        const match = this.text.match(/Just completed a ([\d.]+) (km|mi)/);
        if (match) {
            let distance = parseFloat(match[1]);
            const unit = match[2];
            if (unit === 'km') {
                distance *= 0.621371; // Convert to miles
            }
            return distance;
        }
        return 0;
    }


    // returns a table row which summarizes the tweet with a clickable link to the RunKeeper activity
    getHTMLTableRow(rowNumber:number):string {
        //TODO: 
        const activityType = this.activityType === "unknown" ? "Not specified" : this.activityType.charAt(0).toUpperCase() + this.activityType.slice(1);
        let tweetText = this.writtenText; // The text content written by the user

        // Split the tweet text by spaces to find the URL
        const words = tweetText.split(' ');
        // The URL should be second to last before "#Runkeeper"
        const urlIndex = words.findIndex(word => word === "#Runkeeper") - 1;

        // Check if a URL was found and replace it with a hyperlink
        if (urlIndex > -1 && words[urlIndex].startsWith("https://")) {
            const url = words[urlIndex];
            words[urlIndex] = `<a href="${url}" target="_blank">${url}</a>`;
            tweetText = words.join(' '); // Reconstruct the tweet text with the hyperlinked URL
        }

        // Construct the table row with the provided information
        return `
            <tr>
                <th scope="row">${rowNumber}</th>
                <td>${activityType}</td>
                <td>${tweetText}</td>
            </tr>
        `;
    }
}