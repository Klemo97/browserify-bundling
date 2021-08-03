import _ from 'lodash'

const output = document.getElementById('output')

output.textContent = _.join(
    [
        'Hello', 'world'
    ],
    ' '
)