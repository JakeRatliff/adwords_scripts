//Author: Jake Ratliff, June 2019. Updated August 2021.

var MONTHLY_BUDGET = 50; //change this to your monthly budget max
var EXCLUDED_LABELS = '["branded"]'
//you can add any labels you may want to exclude in future to this list. I only used "branded" as an example label.
//the quotes around your label name are required, it is how this script can read your labels
//for example: '["branded", "special campaign", "holiday sale", "geotarget USA"]'

function main() {
    var itsFirstOfTheMonth = ((new Date()).getDate() == 1); //you can test this any time by setting to true
    var totalCostMTD = getTotalCost().toFixed(2); //you can test this at any spend level by setting to any number
    console.log("Total cost this month: $" + totalCostMTD +
        "; monthly budget: $" + MONTHLY_BUDGET
    );
    if (totalCostMTD >= MONTHLY_BUDGET) {
        console.log("Total spend for campaigns not listed in EXCLUDED_LABELS has reached monthly budget");
        applyLabel();
        pauseCampaigns();
    } else {
        console.log("Total spend for campaigns not listed in EXCLUDED_LABELS is under their monthly budget - no changes.");
    };
    if (itsFirstOfTheMonth) {
        reenableCampaigns();
    };
};

function getTotalCost() {
    var campIter = AdsApp.campaigns()
        .withCondition('LabelNames CONTAINS_NONE ' + EXCLUDED_LABELS)
        .get();
    var totalCost = 0;
    while (campIter.hasNext()) {
        totalCost += campIter.next().getStatsFor("THIS_MONTH").getCost();
    };
    return totalCost;
};

function labelExists(labelToCheck) {
    var labelIterator = AdsApp.labels().get();
    console.log(labelIterator);
    while (labelIterator.hasNext()) {
        var label = labelIterator.next();
        console.log(label.getName())
        if (label == labelToCheck) {
            return true
        } else {
            return false
        }
    }
}

function getAccountLabelNames() {
    var labelNames = [];
    var iterator = AdsApp.labels().get();
    while (iterator.hasNext()) {
        label = iterator.next().getName();
        console.log(label)
        labelNames.push(label);

    }
    return labelNames;
}

function applyLabel() {
    var labelName = 'Paused by Budget Script';
    var existingLabels = getAccountLabelNames();
    if (existingLabels.indexOf(labelName) == -1) {
        AdsApp.createLabel(labelName);
    }
    var campaignIterator = AdsApp.campaigns()
        .withCondition('CampaignStatus = ENABLED')
        .withCondition('LabelNames CONTAINS_NONE ' + EXCLUDED_LABELS)
        .get();
    while (campaignIterator.hasNext()) {
        var campaign = campaignIterator.next();
        console.log("label " + labelName + " applied to " + campaign)
        campaign.applyLabel(labelName);
    };
    console.log('labels applied.');
};

function pauseCampaigns() {
    var campaignIterator = AdsApp.campaigns()
        .withCondition('CampaignStatus = ENABLED')
        .withCondition('LabelNames CONTAINS_NONE ' + EXCLUDED_LABELS)
        .get();
    while (campaignIterator.hasNext()) {
        var campaign = campaignIterator.next();
        campaign.pause();
    };
    console.log('Campaigns not listed in EXCLUDED_LABELS paused');
};

function reenableCampaigns() {
    var label = AdsApp.labels()
        .withCondition('Name = "Paused by Budget Script"')
        .get().next();

    var campaignIterator = label.campaigns().get();

    while (campaignIterator.hasNext()) {
        var campaign = campaignIterator.next();
        campaign.removeLabel('Paused by Budget Script');
        campaign.enable();
    };
    console.log('First of the month: campaigns reenabled')
};
