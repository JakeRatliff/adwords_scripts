// Author: Jake Ratliff, June 2019. Updated August 2021, April 2024. 

//This version of the script checks campaigns by label, and if that label is in "INCLUDED_LABELS",
//then its spend is tallied in the total monthly spend.
//If monthly spend of the campaigns with your in is equal or greater than MONTHLY_BUDGET
//then it pauses all of them.
//If it is the first day of the month, it re-enables all the campaigns it paused.

var MONTHLY_BUDGET = 50; // Change this to your monthly budget max.
var INCLUDED_LABELS = '["monthly_buget"]'; // Only campaigns with these labels will be included in the cost calculation.
// Add any labels you want to include in this list. 
// For example: '["targeted", "priority campaign", "Q1 sale", "main product line"]'

function main() {
    var itsFirstOfTheMonth = ((new Date()).getDate() == 1); // Set to true for testing purposes.
    var totalCostMTD = getTotalCost().toFixed(2);
    console.log("Total cost this month for included campaigns: $" + totalCostMTD +
        "; monthly budget: $" + MONTHLY_BUDGET
    );
    if (totalCostMTD >= MONTHLY_BUDGET) {
        console.log("Total spend for campaigns listed in INCLUDED_LABELS has reached the monthly budget.");
        applyLabel();
        pauseCampaigns();
    } else {
        console.log("Total spend for campaigns listed in INCLUDED_LABELS is under their monthly budget - no changes.");
    }
    if (itsFirstOfTheMonth) {
        reenableCampaigns();
    }
}

function getTotalCost() {
    var campIter = AdsApp.campaigns()
        .withCondition('LabelNames CONTAINS_ANY ' + INCLUDED_LABELS)
        .get();
    var totalCost = 0;
    while (campIter.hasNext()) {
        var campaign = campIter.next();
        totalCost += campaign.getStatsFor("THIS_MONTH").getCost();
    }
    return totalCost;
}

function applyLabel() {
    var labelName = 'Paused by Budget Script';
    var existingLabels = getAccountLabelNames();
    if (existingLabels.indexOf(labelName) === -1) {
        AdsApp.createLabel(labelName);
    }
    var campaignIterator = AdsApp.campaigns()
        .withCondition('CampaignStatus = ENABLED')
        .withCondition('LabelNames CONTAINS_ANY ' + INCLUDED_LABELS)
        .get();
    while (campaignIterator.hasNext()) {
        var campaign = campaignIterator.next();
        campaign.applyLabel(labelName);
        console.log("Label '" + labelName + "' applied to " + campaign.getName());
    }
    console.log('Labels applied.');
}

function pauseCampaigns() {
    var campaignIterator = AdsApp.campaigns()
        .withCondition('CampaignStatus = ENABLED')
        .withCondition('LabelNames CONTAINS_ANY ' + INCLUDED_LABELS)
        .get();
    while (campaignIterator.hasNext()) {
        var campaign = campaignIterator.next();
        campaign.pause();
        console.log("Campaign " + campaign.getName() + " paused.");
    }
    console.log('Campaigns listed in INCLUDED_LABELS paused.');
}

function reenableCampaigns() {
    var label = AdsApp.labels()
        .withCondition('Name = "Paused by Budget Script"')
        .get().next();

    var campaignIterator = label.campaigns().get();

    while (campaignIterator.hasNext()) {
        var campaign = campaignIterator.next();
        campaign.removeLabel('Paused by Budget Script');
        campaign.enable();
        console.log("Campaign " + campaign.getName() + " reenabled.");
    }
    console.log('First of the month: campaigns reenabled.');
}

function getAccountLabelNames() {
    var labelNames = [];
    var iterator = AdsApp.labels().get();
    while (iterator.hasNext()) {
        var label = iterator.next();
        labelNames.push(label.getName());
    }
    return labelNames;
}
