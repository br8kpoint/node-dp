const dputils = require('./node-dp');
const events = require('events');
const request = require('request');
const { check } = require('validator');
const extend = require('xtend');
const dpUtils = require('./dp-utils');
const dpURI = dpUtils.dpURI;
const gifts = require('./gift');
const { Flag } = require('./flag');
const contacts = require('./contact');
const nodemailer = require('nodemailer');

function Donor(data) {
    for (let i = 0; i < Donor.FIELDS.length; i++) {
        this[Donor.FIELDS[i].name] = null;
    }
    this.donor_id = 0; // new donor default
    this.first_name = "";
    this.last_name = "";
    this.middle_name = "";
    this.suffix = "";
    this.title = "";
    this.salutation = "";
    this.prof_title = "";
    this.opt_line = "";
    this.address = "";
    this.address2 = "";
    this.city = "";
    this.state = "";
    this.zip = "";
    this.country = "";
    this.address_type = "";
    this.home_phone = "";
    this.business_phone = "";
    this.fax_phone = "";
    this.mobile_phone = "";
    this.email = "";
    this.org_rec = "";
    this.donor_type = "IN"; // individual by default
    this.nomail = "N";
    this.nomail_reason = "";
    this.narrative = "";
    this.user_id = dpUtils.credentials.username;
    this.other_state_prov = "";
    this.ccInfo = {};
    this.local_id = 0;
    this.udfFields = {};
    this.flags = [];
}

// Utility function to support both Promise and callback
function promiseOrCallback(promise, callback) {
    if (callback) {
        promise.then(result => callback(null, result)).catch(error => callback(error));
    } else {
        return promise;
    }
}
Donor.FIELDS = [
    {"source":"dp","name":"donor_id","type":"numeric","nullable":false,"max":null,"label":"Donor Id","description":"Donor Id"},
    {"source":"dp","name":"first_name","type":"varchar","nullable":true,"max":50,"label":"First Name","description":"First Name"},
    {"source":"dp","name":"last_name","type":"varchar","nullable":false,"max":75,"label":"Last Name","description":"Last Name"},
    {"source":"dp","name":"middle_name","type":"varchar","nullable":true,"max":50,"label":"Middle Name","description":"Middle Name"},
    {"source":"dp","name":"suffix","type":"varchar","nullable":true,"max":50,"label":"Suffix","description":"Suffix"},
    {"source":"dp","name":"title","type":"varchar","nullable":true,"max":50,"label":"Title","description":"Title"},
    {"source":"dp","name":"salutation","type":"varchar","nullable":true,"max":50,"label":"Salutation","description":"Salutation"},
    {"source":"dp","name":"prof_title","type":"varchar","nullable":true,"max":100,"label":"Prof Title","description":"Prof Title"},
    {"source":"dp","name":"opt_line","type":"varchar","nullable":true,"max":100,"label":"Opt Line","description":"Opt Line"},
    {"source":"dp","name":"address","type":"varchar","nullable":true,"max":100,"label":"Address","description":"Address"},
    {"source":"dp","name":"address2","type":"varchar","nullable":true,"max":100,"label":"Address2","description":"Address2"},
    {"source":"dp","name":"city","type":"varchar","nullable":true,"max":50,"label":"City","description":"City"},
    {"source":"dp","name":"state","type":"varchar","nullable":true,"max":30,"label":"State","description":"State"},
    {"source":"dp","name":"zip","type":"varchar","nullable":true,"max":20,"label":"Zip","description":"Zip"},
    {"source":"dp","name":"country","type":"varchar","nullable":true,"max":30,"label":"Country","description":"Country"},
    {"source":"dp","name":"address_type","type":"varchar","nullable":true,"max":30,"label":"Address Type","description":"Address Type"},
    {"source":"dp","name":"home_phone","type":"varchar","nullable":true,"max":40,"label":"Home Phone","description":"Home Phone"},
    {"source":"dp","name":"business_phone","type":"varchar","nullable":true,"max":40,"label":"Business Phone","description":"Business Phone"},
    {"source":"dp","name":"fax_phone","type":"varchar","nullable":true,"max":40,"label":"Fax Phone","description":"Fax Phone"},
    {"source":"dp","name":"mobile_phone","type":"varchar","nullable":true,"max":40,"label":"Mobile Phone","description":"Mobile Phone"},
    {"source":"dp","name":"email","type":"varchar","nullable":true,"max":75,"label":"Email","description":"Email"},
    {"source":"dp","name":"org_rec","type":"varchar","nullable":true,"max":1,"label":"Org Rec","description":"Org Rec"},
    {"source":"dp","name":"donor_type","type":"varchar","nullable":true,"max":30,"label":"Donor Type","description":"Donor Type"},
    {"source":"dp","name":"nomail","type":"varchar","nullable":false,"max":1,"label":"Nomail","description":"Nomail"},
    {"source":"dp","name":"nomail_reason","type":"varchar","nullable":true,"max":30,"label":"Nomail Reason","description":"Nomail Reason"},
    {"source":"dp","name":"narrative","type":"text","nullable":true,"max":2147483647,"label":"Narrative","description":"Narrative"},
    {"source":"dp","name":"tag_date","type":"datetime","nullable":true,"max":null,"label":"Tag Date","description":"Tag Date"},
    {"source":"dp","name":"initial_gift_date","type":"datetime","nullable":true,"max":null,"label":"Initial Gift Date","description":"Initial Gift Date"},
    {"source":"dp","name":"last_contrib_date","type":"datetime","nullable":true,"max":null,"label":"Last Contrib Date","description":"Last Contrib Date"},
    {"source":"dp","name":"last_contrib_amt","type":"money","nullable":true,"max":null,"label":"Last Contrib Amt","description":"Last Contrib Amt"},
    {"source":"dp","name":"ytd","type":"money","nullable":true,"max":null,"label":"Ytd","description":"Ytd"},
    {"source":"dp","name":"ly_ytd","type":"money","nullable":true,"max":null,"label":"Ly Ytd","description":"Ly Ytd"},
    {"source":"dp","name":"ly2_ytd","type":"money","nullable":true,"max":null,"label":"Ly2 Ytd","description":"Ly2 Ytd"},
    {"source":"dp","name":"ly3_ytd","type":"money","nullable":true,"max":null,"label":"Ly3 Ytd","description":"Ly3 Ytd"},
    {"source":"dp","name":"ly4_ytd","type":"money","nullable":true,"max":null,"label":"Ly4 Ytd","description":"Ly4 Ytd"},
    {"source":"dp","name":"ly5_ytd","type":"money","nullable":true,"max":null,"label":"Ly5 Ytd","description":"Ly5 Ytd"},
    {"source":"dp","name":"ly6_ytd","type":"money","nullable":true,"max":null,"label":"Ly6 Ytd","description":"Ly6 Ytd"},
    {"source":"dp","name":"cytd","type":"money","nullable":true,"max":null,"label":"Cytd","description":"Cytd"},
    {"source":"dp","name":"ly_cytd","type":"money","nullable":true,"max":null,"label":"Ly Cytd","description":"Ly Cytd"},
    {"source":"dp","name":"ly2_cytd","type":"money","nullable":true,"max":null,"label":"Ly2 Cytd","description":"Ly2 Cytd"},
    {"source":"dp","name":"ly3_cytd","type":"money","nullable":true,"max":null,"label":"Ly3 Cytd","description":"Ly3 Cytd"},
    {"source":"dp","name":"ly4_cytd","type":"money","nullable":true,"max":null,"label":"Ly4 Cytd","description":"Ly4 Cytd"},
    {"source":"dp","name":"ly5_cytd","type":"money","nullable":true,"max":null,"label":"Ly5 Cytd","description":"Ly5 Cytd"},
    {"source":"dp","name":"ly6_cytd","type":"money","nullable":true,"max":null,"label":"Ly6 Cytd","description":"Ly6 Cytd"},
    {"source":"dp","name":"autocalc1","type":"money","nullable":true,"max":null,"label":"Autocalc1","description":"Autocalc1"},
    {"source":"dp","name":"autocalc2","type":"money","nullable":true,"max":null,"label":"Autocalc2","description":"Autocalc2"},
    {"source":"dp","name":"autocalc3","type":"money","nullable":true,"max":null,"label":"Autocalc3","description":"Autocalc3"},
    {"source":"dp","name":"gift_total","type":"money","nullable":true,"max":null,"label":"Gift Total","description":"Gift Total"},
    {"source":"dp","name":"gifts","type":"numeric","nullable":true,"max":null,"label":"Gifts","description":"Gifts"},
    {"source":"dp","name":"max_date","type":"datetime","nullable":true,"max":null,"label":"Max Date","description":"Max Date"},
    {"source":"dp","name":"max_amt","type":"money","nullable":true,"max":null,"label":"Max Amt","description":"Max Amt"},
    {"source":"dp","name":"avg_amt","type":"money","nullable":true,"max":null,"label":"Avg Amt","description":"Avg Amt"},
    {"source":"dp","name":"yrs_donated","type":"numeric","nullable":true,"max":null,"label":"Yrs Donated","description":"Yrs Donated"},
    {"source":"dp","name":"created_by","type":"varchar","nullable":true,"max":20,"label":"Created By","description":"Created By"},
    {"source":"dp","name":"created_date","type":"datetime","nullable":true,"max":null,"label":"Created Date","description":"Created Date"},
    {"source":"dp","name":"modified_by","type":"varchar","nullable":true,"max":20,"label":"Modified By","description":"Modified By"},
    {"source":"dp","name":"modified_date","type":"datetime","nullable":true,"max":null,"label":"Modified Date","description":"Modified Date"},
    {"source":"dp","name":"donor_rcpt_type","type":"char","nullable":true,"max":1,"label":"Donor Rcpt Type","description":"Donor Rcpt Type"},
    {"source":"dp","name":"address3","type":"varchar","nullable":true,"max":100,"label":"Address3","description":"Address3"},
    {"source":"dp","name":"address4","type":"varchar","nullable":true,"max":100,"label":"Address4","description":"Address4"},
    {"source":"dp","name":"ukcounty","type":"varchar","nullable":true,"max":100,"label":"Ukcounty","description":"Ukcounty"},
    {"source":"dp","name":"gift_aid_eligible","type":"char","nullable":true,"max":1,"label":"Gift Aid Eligible","description":"Gift Aid Eligible"},
    {"source":"dp","name":"initial_temp_record_id","type":"numeric","nullable":true,"max":null,"label":"Initial Temp Record Id","description":"Initial Temp Record Id"},
    {"source":"dp","name":"frequent_temp_record_id","type":"numeric","nullable":true,"max":null,"label":"Frequent Temp Record Id","description":"Frequent Temp Record Id"},
    {"source":"dp","name":"recent_temp_record_id","type":"numeric","nullable":true,"max":null,"label":"Recent Temp Record Id","description":"Recent Temp Record Id"},
    {"source":"dp","name":"import_id","type":"numeric","nullable":true,"max":null,"label":"Import Id","description":"Import Id"},
    {"source":"dp","name":"receipt_delivery","type":"varchar","nullable":true,"max":1,"label":"Receipt Delivery","description":"Receipt Delivery"},
    {"source":"dp","name":"no_email","type":"varchar","nullable":true,"max":1,"label":"No Email","description":"No Email"},
    {"source":"dp","name":"no_email_reason","type":"varchar","nullable":true,"max":200,"label":"No Email Reason","description":"No Email Reason"},
    {"source":"dp","name":"email_type","type":"varchar","nullable":true,"max":20,"label":"Email Type","description":"Email Type"},
    {"source":"dp","name":"email_status","type":"varchar","nullable":true,"max":50,"label":"Email Status","description":"Email Status"},
    {"source":"dp","name":"email_status_date","type":"datetime","nullable":true,"max":null,"label":"Email Status Date","description":"Email Status Date"},
    {"source":"dp","name":"opt_out_source","type":"varchar","nullable":true,"max":200,"label":"Opt Out Source","description":"Opt Out Source"},
    {"source":"dp","name":"opt_out_reason","type":"varchar","nullable":true,"max":200,"label":"Opt Out Reason","description":"Opt Out Reason"},
    {"source":"dp","name":"CC_donor_import_time","type":"datetime","nullable":true,"max":null,"label":"CC Donor Import Time","description":"CC Donor Import Time"},
    {"source":"dp","name":"cc_contact_id","type":"bigint","nullable":true,"max":null,"label":"Cc Contact Id","description":"Cc Contact Id"},
];

Donor.UDFFIELDS = [
    {"source":"dpudf","name":"WEBSITE_PASSWORD","type":"varchar","nullable":true,"max":null,"label":"Website Password","description":"Password used to log in to the donation page."},
    {"source":"dpudf","name":"ASSIGNED_THANKYOUS","type":"varchar","nullable":true,"max":null,"label":"Assigned Thank You Solicitiations","description":"Comma separated list of assigned thank you solicitiations"},
    {"source":"dpudf","name":"LAST_CONTACT_DATE","type":"datetime","nullable":true,"max":null,"label":"Last DP Contact Date","description":"Last DP Contact Date"},
    {"source":"dpudf","name":"FUNDRAISERS","type":"varchar","nullable":true,"max":200,"label":"Ministry Callers","description":"Ministry Callers"},
    {"source":"dpudf","name":"PAYPAL_EMAIL","type":"varchar","nullable":true,"max":200,"label":"Paypal Email","description":"Paypal Email"},
    {"source":"dpudf","name":"EFT_ROUTING_NUMBER","type":"varchar","nullable":false,"max":200,"label":"Eft Routing Number","description":"Eft Routing Number"},
    {"source":"dpudf","name":"EFT_ACCOUNT_NUMBER","type":"varchar","nullable":true,"max":200,"label":"Eft Account Number","description":"Eft Account Number"},
    {"source":"dpudf","name":"PAYMENT_SYSTEM","type":"varchar","nullable":true,"max":200,"label":"Payment System","description":"Payment System"},
    {"source":"dpudf","name":"PICTURE_URL","type":"varchar","nullable":true,"max":200,"label":"Picture Url","description":"Picture Url"},
    {"source":"dpudf","name":"CHASE_PROFILE_ID","type":"varchar","nullable":true,"max":200,"label":"Chase Profile Id","description":"Chase Profile Id"},
    {"source":"dpudf","name":"PAYMENT_PROFILE_ID","type":"varchar","nullable":true,"max":200,"label":"Payment Profile Id","description":"Payment Profile Id"},
    {"source":"dpudf","name":"EMAIL_CONFIRMED_DATE","type":"datetime","nullable":true,"max":200,"label":"Email Confirmed Date","description":"Email Confirmed Date"},
    {"source":"dpudf","name":"EMAIL_CONF_REQ_DATE","type":"datetime","nullable":true,"max":200,"label":"Date when confirmation reply email sent.","description":"Date when confirmation reply email sent."},
    {"source":"dpudf","name":"EMAIL_CONF_REC_DATE","type":"datetime","nullable":true,"max":200,"label":"Date when confirmation reply email received.","description":"Date when confirmation reply email received."},
    {"source":"dpudf","name":"EMAIL_CONF_REMINDER","type":"datetime","nullable":true,"max":200,"label":"Email Confirmation Reminder","description":"Email Confirmation Reminder Sent"},
	{"source":"dpudf","name":"CHAPTER_CHOICE","type":"varchar","nullable":true,"max":200,"label":"Chapter Name","description":"Chapter Name"},
    {"source":"dpudf","name":"EVANGLIST_NAME","type":"varchar","nullable":true,"max":200,"label":"Evangelist Name","description":"Evangelist Name"},
    {"source":"dpudf","name":"CHAPTERSCHOSEN","type":"varchar","nullable":true,"max":200,"label":"Chapters Paid","description":"Chapters Paid"},
    {"source":"dpudf","name":"IN_HONOR_OF","type":"varchar","nullable":true,"max":200,"label":"In Honor Of","description":"In Honor Of"},
    {"source":"dpudf","name":"SPECIAL_NOTE","type":"varchar","nullable":true,"max":200,"label":"Special Note","description":"Special Note"},
    {"source":"dpudf","name":"CCTYPE","type":"varchar","nullable":true,"max":200,"label":"Credit Card Type","description":"Credit Card Type"},
    {"source":"dpudf","name":"SEC_CODE","type":"varchar","nullable":true,"max":200,"label":"Security Code","description":"Security Code"},
    {"source":"dpudf","name":"CCNUM","type":"varchar","nullable":true,"max":200,"label":"Credit Card Number","description":"Credit Card Number"},
    {"source":"dpudf","name":"CCEXP","type":"varchar","nullable":true,"max":200,"label":"Credit Card Exp. Date","description":"Credit Card Exp. Date"},
    {"source":"dpudf","name":"TZ_OFFSET","type":"varchar","nullable":true,"max":200,"label":"Time Zone Offset","description":"Time Zone Offset in minutes from UTC/GMT"},
    {"source":"dpudf","name":"TIME_ZONE","type":"varchar","nullable":true,"max":200,"label":"Time Zone Name","description":"Time Zone Name"},
    {"source":"dpudf","name":"TIME_ZONE_ID","type":"varchar","nullable":true,"max":200,"label":"Time Zone ID","description":"Olsen Time Zone ID"},
    {"source":"dpudf","name":"LAT","type":"varchar","nullable":true,"max":null,"label":"Latitude","description":"Latitude Coordinate"},
    {"source":"dpudf","name":"LNG","type":"varchar","nullable":true,"max":null,"label":"Longitude","description":"Longitude Coordinate"},
    {"source":"dpudf","name":"Gender","type":"varchar","nullable":true,"max":200,"label":"Gender","description":"Gender"},
    ];
Donor.JOIN_MAP = {
    "dpudf": {
        "source": "dp.donor_id",
        "dest": "= dpudf.donor_id"
    },
    "dpgift": {
        "source": "dp.donor_id",
        "dest": "= dpgift.donor_id"
    }
};

Donor.QUERY_FIELDS = Donor.FIELDS.concat(Donor.UDFFIELDS);


Donor.prototype.saveUdf = function(donor_id, callback) {
    const promise = new Promise((resolve, reject) => {
        let update = "UPDATE dpudf set ";
        for(var i = 0; i < Donor.UDFFIELDS.length; i++){
            if(Donor.UDFFIELDS[i].type == "varchar" || Donor.UDFFIELDS[i].type == "datetime"){
                 update += Donor.UDFFIELDS[i].name; 
                 update += this.udfFields[Donor.UDFFIELDS[i].name] ? " = '" + this.udfFields[Donor.UDFFIELDS[i].name] + "'," : " = null,";            
             }
             else update += Donor.UDFFIELDS[i].name + ' = ' + this.udfFields[Donor.UDFFIELDS[i].name] + ",";
         }
         //remove comma at end
         update = update.substring(0, update.length - 1);
         update += " where donor_id = " + donor_id;
        dpUtils.executeNonQuery(update, (err, result) => {
            err ? reject(err) : resolve(result);
        });
    });

    return promiseOrCallback(promise, callback);
};

function handleOpenTag(n) {
    if (n.name === 'field') {
      this.donor_id = parseInt(n.attributes.value) || this.donor_id;
      // Set your breakpoint here
    }
  }
Donor.prototype.save = function(callback) {
    const promise = new Promise((resolve, reject) => {
        try {
            // Uncomment validate method if available
            // this.validate();
        } catch (ex) {
            return reject(new Error("Validation error"), ex);
        }

        if (!this.last_name && !this.first_name && !this.email) {
            const smtpOptions = {
                secure: false,
                ignoreTLS: true,
                host: "smtp.sendgrid.net",
                port: 587,
                auth: { user: "apikey", pass: dputils.settings.sendgrid_pass }
            };
            const transport = nodemailer.createTransport(smtpOptions);
            const mail = {
                from: "notifications@biblesforisrael.com",
                to: ["br8kpoint@gmail.com"],
                subject: "Error Saving Blank Donor!",
                html: `<html><body><p>Attempting to save blank donor:</p><pre>${JSON.stringify(this, null, '\t')}</pre></body></html>`
            };
            transport.sendMail(mail, err => err && console.error("Mail sending error:", err));
        }

        const params = [
            this.donor_id, this.first_name, this.last_name, this.middle_name, this.suffix, this.title,
            this.salutation, this.prof_title, this.opt_line, this.address, this.address2, this.city,
            this.state, this.zip, this.country, this.address_type, this.home_phone, this.business_phone,
            this.fax_phone, this.mobile_phone, this.email, this.org_rec, this.donor_type, this.nomail,
            this.nomail_reason, this.narrative, this.user_id
        ];

        const parser = require('sax').createStream(false, { lowercasetags: true });
        parser.on('error', err => reject(err));
        parser.on('opentag', handleOpenTag.bind(this));
        parser.on('end', () => this.saveUdf(this.donor_id).then(resolve).catch(reject));
        let url = 
        request(dpURI('dp_savedonor', params)).on('response', response => {
            dpUtils.settings.debug && console.log("Response:", response.statusCode);
        }).pipe(parser);
    });

    return promiseOrCallback(promise, callback);
};

Donor.prototype.destroy = function(callback) {
    const promise = new Promise((resolve, reject) => {
        request(dpURI("dp_deletedonor", [this.donor_id]), (error, response, body) => {
            !error && response.statusCode === 200 ? resolve(body) : reject(error);
        });
    });

    return promiseOrCallback(promise, callback);
};

Donor.prototype.getGifts = function(callback) {
    const promise = new Promise((resolve, reject) => {
        gifts.getByDonorId(this.donor_id, (err, gifts) => {
            err ? reject(err) : resolve(gifts);
        });
    });

    return promiseOrCallback(promise, callback);
};

Donor.prototype.getFlags = function(callback) {
    const promise = new Promise((resolve, reject) => {
        Flag.getByDonorId(this.donor_id, (err, flags) => err ? reject(err) : resolve(flags));
    });

    return promiseOrCallback(promise, callback);
};

Donor.prototype.addFlag = function(code, callback) {
    const promise = new Promise((resolve, reject) => {
        const flag = new Flag();
        flag.donor_id = this.donor_id;
        flag.flag = code;

        Flag.add(flag, (err, newFlag) => {
            if (err) reject(err);
            else {
                this.flags.push(newFlag);
                resolve(newFlag);
            }
        });
    });

    return promiseOrCallback(promise, callback);
};

Donor.get = function(ids, callback) {
    const retrieveFlags = (donors) => {
        if (Array.isArray(donors)) {
            return Promise.all(donors.map(donor => donor.getFlags()));
        }
        return donors.getFlags();
    };

    const promise = new Promise((resolve, reject) => {
        if (typeof ids === 'number') getByID(ids).then(resolve).catch(reject);
        if (Array.isArray(ids)) getByArray(ids).then(resolve).catch(reject);
        if (typeof ids === 'string') getBySql(ids).then(resolve).catch(reject);
    }).then(donors => retrieveFlags(donors).then(() => donors));

    return promiseOrCallback(promise, callback);
};

Donor.query = function(options, callback) {
    const promise = new Promise((resolve, reject) => {
        options = extend({}, Donor.QUERY_DEFAULTS, options);
        const buildSqlQuery = dpUtils.buildSql(options, Donor.JOIN_MAP);
        const countSql = `select count(*) from ${buildSqlQuery}`;
        const querySql = `select row_number() over (order by ${options.orderBy}) as rid, ${buildSelect()} from ${buildSqlQuery}`;
        const paginatedQuerySql = options.limit ? `select * from (${querySql}) as innerselect where rid between ${options.offset} and ${options.offset + options.limit - 1}` : querySql;

        dpUtils.executeScalar(countSql, (err, total) => {
            if (err) return reject(err);
            getBySql(paginatedQuerySql).then(donors => resolve({ total, results: donors, limit: options.limit, offset: options.offset, query: options }));
        });
    });

    return promiseOrCallback(promise, callback);
};

const buildSelect = () => {
    const dpfields = ["dp.*"];
    const dpudffields = Donor.UDFFIELDS.map(item => `${item.source}.${item.name}`);
    return dpfields.concat(dpudffields).join(", ");
};

function getByID(id) {
    return new Promise((resolve, reject) => {
        const sql = `select * from dp join dpudf on dp.donor_id = dpudf.donor_id where dp.donor_id = ${id}`;
        getBySql(sql).then(donors => {
            donors.length === 1 ? resolve(donors[0]) : reject(new Error(`Found multiple donors for id: ${id}`));
        }).catch(reject);
    });
}

function getByArray(ids) {
    const sql = `select * from dp join dpudf on dp.donor_id = dpudf.donor_id where dp.donor_id in (${ids.join()})`;
    return getBySql(sql);
}

function getBySql(sql) {
    return new Promise((resolve, reject) => {
        const parser = require('sax').createStream(false, { lowercasetags: true });
        const donors = [];
        parser.on('error', e => reject(e));
        parser.on('opentag', n => Donor.handleSaxOpenTag(n, donors));
        parser.on('end', () => resolve(donors));

        request(dpURI(sql)).pipe(parser);
    });
}

Donor.handleSaxOpenTag = function(n, context) {
    if (n.name === 'field') {
        const donor = context[context.length - 1];
        if (donor) {
            const field = Donor.FIELDS.find(item => item.name === n.attributes.name);
            if (field) donor[n.attributes.name] = dpUtils.convertValue(n.attributes.value, field);
            else donor.udfFields[n.attributes.name] = n.attributes.value;
        }
    } else if (n.name === "record") {
        context.push(new Donor());
    }
};

module.exports.Donor = Donor;
