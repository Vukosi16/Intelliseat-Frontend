import { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

export default function TwoWeekCalendar() {

  const highlightedDates = [
    '2026-10-02',
    '2026-10-05',
    '2026-10-09',
    '2026-10-12',
  ];

  const today = new Date();

  // Get Monday of the current week
  const monday = new Date(today);
  const day = today.getDay();
  const difference = day === 0 ? -6 : 1 - day;

  monday.setDate(today.getDate() + difference);

  // Create the 14 days
  const dates = [];

  for (let i = 0; i < 14; i++) {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    dates.push(date);
  }

  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  const monthYear = today.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const [selectedDate, setSelectedDate] = useState(formatDate(today));

  return (
    <View style={styles.container}>

      {/* Heading */}
      <View style={styles.heading}>
        <Text style={styles.title}>
          Assessment Calendar
        </Text>

        <Text style={styles.monthYear}>
          {monthYear}
        </Text>
      </View>

      {/* Calendar */}
      <View style={styles.calendar}>

        {dates.map((date) => {

          const dateString = formatDate(date);
          const isHighlighted = highlightedDates.includes(dateString);
          const isSelected = selectedDate === dateString;

          return (
            <Pressable
              key={dateString}
              style={[
                styles.day,
                isSelected && styles.selectedDay
              ]}
              onPress={() => setSelectedDate(dateString)}
            >

              <Text style={styles.dayName}>
                {dayNames[date.getDay()]}
              </Text>

              <Text style={styles.date}>
                {date.getDate()}
              </Text>

              {isHighlighted && (
                <View style={styles.dot} />
              )}

            </Pressable>
          );
        })}

      </View>

    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    width: '92%',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'lightgray',
    padding: 12, 
  },

  heading: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },

  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },

  monthYear: {
    fontSize: 15,
    fontWeight: '600',
    color: 'white',
  },

  calendar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  day: {
    width: '13%',
    alignItems: 'center',
    padding: 7,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 8,
    marginBottom: 6,
    color: 'white',
  },
  
  selectedDay: {
    backgroundColor: '#3B82F6',
  },

  dayName: {
    fontSize: 10,
    color: 'white',
  },

  date: {
    fontSize: 15,
    fontWeight: 'bold',
    color: 'white',
  },

  dot: {
    width: 4,
    height: 4,
    borderRadius: 4,
    backgroundColor: 'red',
    marginTop: 3,
  },

});


