import moment from 'moment'

export const formatDate = value =>
  moment(value).format('MMMM Do YYYY, h:mm:ss a')
