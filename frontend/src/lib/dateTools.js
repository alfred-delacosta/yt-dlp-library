export const dateTools = {
    convertToMySQLDateTime(date) {
        let sqlDate = "";
        let sqlTime = "";
        let sqlDateTime = "";

        // "5/10/2021, 11:22:48 AM"
        let javaScriptDateTimeSplit = date.split(",");
        let jDate = javaScriptDateTimeSplit[0].trim();
        let jTime = javaScriptDateTimeSplit[1].trim();

        //#region Date Conversion

        let jMonth = jDate.split("/")[0];
        let jDay = jDate.split("/")[1];
        let jYear = jDate.split("/")[2];

        if (parseInt(jMonth) < 10) {
            jMonth = "0" + jMonth;
        }

        if (parseInt(jDay) < 10) {
            jDay = "0" + jDay;
        }

        sqlDate = `${jYear}-${jMonth}-${jDay}`;
        //#endregion

        //#region Time Conversion
        let jAmPm = jTime.split(" ")[1];
        let jHour = jTime.split(":")[0];
        let jMinute = jTime.split(":")[1];
        let jSecond = jTime.split(":")[2];

        // Remove the AM or PM
        jSecond = jSecond.split(/\s/)[0].trim();

        if (jHour !== "12" && jAmPm == "PM") {
            let jHourInt = parseInt(jHour);
            jHourInt = jHourInt + 12;

            jHour = jHourInt.toString();
        }

        if (parseInt(jHour) < 10) {
            jHour = "0" + jHour;
        }

        sqlTime = `${jHour}:${jMinute}:${jSecond}`;
        //#endregion

        sqlDateTime = `${sqlDate} ${sqlTime}`;

        return sqlDateTime;
    }

};