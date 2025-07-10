package com.prescription.util;


import java.time.LocalDate;
import java.util.Arrays;
import java.util.Set;
import java.util.stream.Collectors;

public class AvailabilityUtil {

    public static Set<Integer> parseDaysOfWeek(String daysOfWeekStr) {
        if (daysOfWeekStr == null || daysOfWeekStr.trim().isEmpty()) {
            return Set.of();
        }

        return Arrays.stream(daysOfWeekStr.split(","))
                .map(String::trim)
                .map(Integer::parseInt)
                .collect(Collectors.toSet());
    }

    public static String formatDaysOfWeek(Set<Integer> daysOfWeek) {
        return daysOfWeek.stream()
                .map(String::valueOf)
                .collect(Collectors.joining(","));
    }

    public static Set<LocalDate> parseSpecificDates(String specificDatesStr) {
        if (specificDatesStr == null || specificDatesStr.trim().isEmpty()) {
            return Set.of();
        }

        return Arrays.stream(specificDatesStr.split(","))
                .map(String::trim)
                .map(LocalDate::parse)
                .collect(Collectors.toSet());
    }

    public static String formatSpecificDates(Set<LocalDate> dates) {
        return dates.stream()
                .map(LocalDate::toString)
                .collect(Collectors.joining(","));
    }

    public static boolean isDateInDaysOfWeek(LocalDate date, Set<Integer> daysOfWeek) {
        int dayOfWeek = date.getDayOfWeek().getValue(); // 1=Monday, 7=Sunday
        return daysOfWeek.contains(dayOfWeek);
    }
}
