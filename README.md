Sure, here's an example of a README file you could include:

# Scheduling App

This is a scheduling application built with Node.js and Sequelize ORM. It allows users to view available slots for various services and book appointments. 

## Getting Started

### Prerequisites

- Node.js
- MySQL server

### Installation

1. Clone the repository.
2. Install dependencies with `npm install`.
3. Create a MySQL database with  `npx sequelize-cli db:create`. This will create DB `booking_system`
4. Configure your MySQL username and password in the `config/config.json` file.
5. Run database migrations with `npx sequelize-cli db:migrate`.
6. Seed the database with sample data with `npx sequelize-cli db:seed:all`.
7. Start the server with `npm start`.

### Usage

### GET /available-slots

Returns a list of available appointment slots for each service for a given date. By default, the date is set to today. Send a GET request to `http://localhost:8000/api/available-slots` 

#### Query parameters

- `date`: The date for which to retrieve available slots, in the format `YYYY-MM-DD`. Defaults to today.

#### Example response

```
{
  "available_slots": [
    {
      "service_name": "Haircut",
      "slots": [
        {
          "day_of_week": 0,
          "slots": [
            {
              "start_time": "09:00",
              "end_time": "09:45",
              "max_clients": 2,
              "available_users": 1
            },
            {
              "start_time": "10:00",
              "end_time": "10:45",
              "max_clients": 2,
              "available_users": 2
            },
            {
              "start_time": "11:00",
              "end_time": "11:45",
              "max_clients": 2,
              "available_users": 0
            }
          ]
        }
      ]
    }
  ]
}
```
### POST /book-appointment

Books an appointment for one or more users. Send a POST request to `http://localhost:8000/api/book-appointment` 

#### Request body

```
{
  "serviceId": 1,
  "scheduleId": 1,
  "appointmentDate": "2023-05-04",
  "startTime": "09:00",
  "endTime": "09:45",
  "users": [
    {
      "firstName": "John",
      "lastName": "Doe",
      "email": "johndoe@example.com"
    }
  ]
}
```

#### Example response

```
{
  "message": "Appointment booked successfully!",
  "appointments": [
    {
      "id": 1,
      "service_id": 1,
      "user_id": 1,
      "schedule_id": 1,
      "appointment_date": "2023-05-04",
      "start_time": "09:00:00",
      "end_time": "09:45:00"
    }
  ]
}
```

### Testing

To run the test suite, use the command `npm test`. This will run all test cases located in the `tests` directory.

## Contributing

Not open for contribution

## License

This project is licensed under the Zain Tanveer.