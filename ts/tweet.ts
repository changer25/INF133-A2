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
        return !(this.text.includes("Check it out!") && this.text.includes("Just completed a"));
    }

    get writtenText():string {
        if(!this.written) {
            return "";
        }


        // Start with the text without the hashtag and the link, as obtained in `written`
        let textWithoutHashtag = this.text.replace("#RunKeeper", "");
        let lastSpaceIndex = textWithoutHashtag.lastIndexOf(" ");
        let textWithoutLink = textWithoutHashtag.substring(0, lastSpaceIndex);


        return textWithoutLink;        

    }

    get activityType():string {
        if (this.source != 'completed_event') {
            return "unknown";
        }
        //TODO: parse the activity type from the text of the tweet
        return "";
    }

    get distance():number {
        if(this.source != 'completed_event') {
            return 0;
        }
        //TODO: prase the distance from the text of the tweet
        return 0;
    }

    getHTMLTableRow(rowNumber:number):string {
        //TODO: return a table row which summarizes the tweet with a clickable link to the RunKeeper activity
        return "<tr></tr>";
    }
}