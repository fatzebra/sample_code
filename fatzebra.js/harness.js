const testCards = [
  { number: '4000000000001000', group: '3ds2', description: 'Successful Frictionless Authentication' },
  { number: '4000000000001026', group: '3ds2', description: 'Attempts Stand-In Frictionless' },
  { number: '4000000000001034', group: '3ds2', description: 'Unavailable Frictionless' },
  { number: '4000000000001059', group: '3ds2', description: 'Authentication Not Available on Lookup' },
  { number: '4000000000001067', group: '3ds2', description: 'Error on Lookup' },
  { number: '4000000000001075', group: '3ds2', description: 'Timeout on cmpi_lookup' },
  { number: '4000000000001083', group: '3ds2', description: 'Bypassed Authentication' },
  { number: '4000000000001018', group: '3ds2', description: 'Failed Frictionless' },
  { number: '4000000000001042', group: '3ds2', description: 'Rejected Frictionless' },
  { number: '4000000000001091', group: '3ds2', description: 'Challenge' }
]

const cardListContainer = $('#card-list');

const createRow = function(item) {
  let input;

  input = "<tr>";
  input += "<td>" + item.group + "</td>";
  input += "<td>" + item.number + "</td>";
  input += "<td>" + item.description + "</td>";
  input += "</tr>";

  return input;
}

for (let i = 0; i < testCards.length; i++) {
  cardListContainer.append(createRow(testCards[i]));
}

function randomString() {
  return Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);
}

const SDK_PARAMS = [
  {
    group: 'base',
    params: [
      { name: 'accessToken', default: '' },
      { name: 'username', default: '' },
      { name: 'sharedSecret', default: '' }
    ]
  },
  {
    group: 'paymentIntent',
    params: [
      { name: 'amount', default: 100 },
      { name: 'currency', default: 'AUD' },
      { name: 'reference', default: randomString() }
    ]
  },
  {
    group: 'customer',
    params: [
      { name: 'firstName', default: 'John' },
      { name: 'lastName', default: 'Doe' },
      { name: 'email', default: 'john.doe@123.com' },
      { name: 'address', default: '123 Australia Blvd.' },
      { name: 'city', default: 'Sydney' },
      { name: 'postcode', default: '2000' },
      { name: 'state', default: 'NSW' },
      { name: 'country', default: 'AU' }
    ]
  }
]

const HPP_PERMITTED_OPTIONS = [
  { name: 'buttonText', type: 'string', default: '' },
  { name: 'cards', type: 'string', default: '' },
  { name: 'css', type: 'string', default: '' },
  { name: 'cssSignature', type: 'string', default: '' },
  { name: 'logoUrl', type: 'string', default: '' },
  { name: 'hideButton', type: 'boolean', default: false },
  { name: 'hideLogos', type: 'boolean', default: true },
  { name: 'showEmail', type: 'boolean', default: false },
  { name: 'showExtras', type: 'boolean', default: false },
  { name: 'enableSca', type: 'boolean', default: true },
  { name: 'tokenizeOnly', type: 'boolean', default: false }
];

const createTextField = function(item) {
  let input;

  input = "<div class='form-group'>";
  input += "<label for='" + item.name + "' class='control-label'>" + item.name + "</label>";
  input += "<input type='text' id='" + item.name + "' name='" + item.name + "' class='form-control' value='" + item.default + "'>";
  input += "</div>";

  return input;
}

const createCheckBox = function(item) {
  const shouldCheck = item.default ? 'checked' : '';
  let input;

  input = "<div class='form-group form-check'>";
  input += "<input type='checkbox' class='form-check-input' id='" + item.name + "' name='" + item.name + "' value='1' " + shouldCheck + ' />';
  input += "<label class='form-check-label' for='" + item.name + "'>" + item.name + "</label>";
  input += "</div>";

  return input;
}

const sdkOptionsContainer = $('#sdk-options');

for (const group of SDK_PARAMS) {
  sdkOptionsContainer.append('<h4>' + group.group + '</h4>');
  sdkOptionsContainer.append('<hr/>');

  for (const item of group.params) {
    sdkOptionsContainer.append(createTextField(item));
  }

  sdkOptionsContainer.append('<br/>');
}

const paynowOptionsContainer = $('#paynow-options');

for (const option of HPP_PERMITTED_OPTIONS) {
  let input;
  switch(option.type) {
    case 'boolean':
      input = createCheckBox(option);
      break;
    case 'string':
      input = createTextField(option);
      break;
  }
  paynowOptionsContainer.append(input);
}


const loadHPP = function() {
  const accessToken  = $('#accessToken').val();
  const username     = $('#username').val(); 
  const sharedSecret = $('#sharedSecret').val();      
  const amount       = parseInt($('#amount').val());
  const currency     = $('#currency').val();   
  const reference    = $('#reference').val();    
  const firstName    = $('#firstName').val();   
  const lastName     = $('#lastName').val();   
  const email        = $('#email').val();   
  const address      = $('#address').val();    
  const city         = $('#city').val();   
  const postcode     = $('#postcode').val();   
  const state        = $('#state').val();   
  const country      = $('#country').val();

  window.localStorage.setItem('fz-access-token', accessToken);

  const verification = CryptoJS.HmacMD5([reference, amount, currency].join(':'), sharedSecret).toString();

  const getPayNowOptions = function() {
    let result = {};

    for (const option of HPP_PERMITTED_OPTIONS) {
      switch(option.type) {
        case 'boolean':
          result[option.name] = $('#' + option.name).is(":checked")
          break;
        case 'string':
          let value = $('#' + option.name).val();
          if (value) {
            result[option.name] = value;
          }
          break;
      }
    }
    return result;
  }

  const fz = new FatZebra({
    username,
    test: true
  });

  fz.on('fz.sca.success', function(event) {
    console.log('fz.sca.success');
    console.log(JSON.stringify(event.detail))
  })

  fz.on('fz.sca.error', function(event) {
    console.log('fz.sca.error');
    console.log(JSON.stringify(event.detail))
  })

  // fz.validation,error only captures errors related to SDK methods, such as renderPaymentsPage.
  // Please subscribe to fz.form_validation.error for errors related to Hosted Payments Page.
  fz.on('fz.validation.error', function(event) {
    console.log('fz.validation.error');
    console.log(JSON.stringify(event.detail))
  })

  // Capture form validation errors on the Hosted Payments Page.
  // Only subscribe to this event if you'd like to customise call-to-action following validation errors.
  fz.on('fz.form_validation.error', function(event) {
    console.log('fz.form_validation.error');
    console.log(JSON.stringify(event.detail))
  })

  fz.on('fz.tokenization.success', function(event) {
    console.log('fz.tokenization.success');
    console.log(JSON.stringify(event.detail))
  })

  fz.on('fz.tokenization.error', function(event) {
    console.log('fz.tokenization.error');
    console.log(JSON.stringify(event.detail))
  })

  fz.on('fz.payment.success', function(event) {
    console.log('fz.payment.success');
    console.log(JSON.stringify(event.detail))
    // Verify data integrity with your backend via ajax before consuming transaction data.
    alert('payment success!');
    
  })

  fz.on('fz.payment.error', function(event) {
    console.log('fz.payment.error');
    console.log(JSON.stringify(event.detail))
    alert('payment error!');
  })

  fz.renderPaymentsPage({
    containerId: 'fz-iframe',
    customer: {
      firstName,
      lastName,
      email,
      address,
      city,
      postcode,
      state,
      country
    },
    paymentIntent: {
      payment: {
        amount,
        currency,
        reference
      },
      verification
    },
    options: getPayNowOptions()
  })
}

const refreshPage = function() {
  location.reload();
}

$('#load-hpp').click(loadHPP);
$('#reset').click(refreshPage);