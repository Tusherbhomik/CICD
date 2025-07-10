package com.prescription.service;

import com.prescription.dto.AvailabilityTemplateDTO;
import com.prescription.dto.AvailabilityExceptionDTO;
import com.prescription.dto.DoctorAvailabilitySlotDTO;
import com.prescription.dto.AppointmentSettingsDTO;
import com.prescription.entity.*;
import com.prescription.repository.*;
import com.prescription.util.AvailabilityUtil;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.*;

@Service
@Transactional
public class DoctorAvailabilityService {

    @Autowired
    private AvailabilityTemplateRepository templateRepository;

    @Autowired
    private AvailabilityExceptionRepository exceptionRepository;

    @Autowired
    private DoctorAvailabilitySlotRepository slotRepository;

    @Autowired
    private AppointmentSettingsRepository settingsRepository;

    @Autowired
    private UserRepository userRepository;

    // ============= TEMPLATE MANAGEMENT =============

    public AvailabilityTemplate createTemplate(Long doctorId, AvailabilityTemplateDTO dto) {
        System.out.println(2);
        User doctor = userRepository.findById(doctorId)
                .orElseThrow(() -> new EntityNotFoundException("Doctor not found"));

        System.out.println(3);
        AvailabilityTemplate template = new AvailabilityTemplate();
        template.setDoctor(doctor);
        template.setTemplateName(dto.getTemplateName());
        System.out.println(3.1);
        System.out.println(dto.getScheduleType());
        System.out.println(dto);
        template.setScheduleType(AvailabilityTemplate.ScheduleType.valueOf(dto.getScheduleType()));
        System.out.println(3.2);
        template.setStartTime(dto.getStartTime());
        System.out.println(3.3);
        template.setEndTime(dto.getEndTime());
        System.out.println(3.4);
        template.setActive(dto.isActive());
        System.out.println(3.5);
        template.setPriority(dto.getPriority() != null ? dto.getPriority() : 0);
        System.out.println(4);

        // Set schedule-specific fields
        System.out.println(dto.getScheduleType());
        switch (AvailabilityTemplate.ScheduleType.valueOf(dto.getScheduleType())) {
            case WEEKLY:
                System.out.println(1);
                if (dto.getDaysOfWeek() != null) {
                    template.setDaysOfWeek(AvailabilityUtil.formatDaysOfWeek(dto.getDaysOfWeek()));
                }
                break;
            case SPECIFIC_DATE_RANGE:
                System.out.println(2);
                template.setStartDate(dto.getStartDate());
                template.setEndDate(dto.getEndDate());
                break;
            case SPECIFIC_DATES:
                System.out.println(3);
                if (dto.getSpecificDates() != null) {
                    template.setSpecificDates(AvailabilityUtil.formatSpecificDates(dto.getSpecificDates()));
                }
                break;
        }
        System.out.println(5);

        AvailabilityTemplate savedTemplate = templateRepository.save(template);
        System.out.println(6);

        // Generate slots for the next 30 days
        generateSlotsForTemplate(savedTemplate, LocalDate.now(), LocalDate.now().plusDays(30));
        System.out.println(7);

        return savedTemplate;
    }

    public AvailabilityTemplate updateTemplate(Long templateId, AvailabilityTemplateDTO dto) {
        AvailabilityTemplate template = templateRepository.findById(templateId)
                .orElseThrow(() -> new EntityNotFoundException("Template not found"));

        template.setTemplateName(dto.getTemplateName());
        template.setScheduleType(AvailabilityTemplate.ScheduleType.valueOf(dto.getScheduleType()));
        template.setStartTime(dto.getStartTime());
        template.setEndTime(dto.getEndTime());
        template.setActive(dto.isActive());
        template.setPriority(dto.getPriority() != null ? dto.getPriority() : 0);

        // Clear existing schedule-specific fields
        template.setDaysOfWeek(null);
        template.setStartDate(null);
        template.setEndDate(null);
        template.setSpecificDates(null);

        // Set new schedule-specific fields
        switch (AvailabilityTemplate.ScheduleType.valueOf(dto.getScheduleType())) {
            case WEEKLY:
                if (dto.getDaysOfWeek() != null) {
                    template.setDaysOfWeek(AvailabilityUtil.formatDaysOfWeek(dto.getDaysOfWeek()));
                }
                break;
            case SPECIFIC_DATE_RANGE:
                template.setStartDate(dto.getStartDate());
                template.setEndDate(dto.getEndDate());
                break;
            case SPECIFIC_DATES:
                if (dto.getSpecificDates() != null) {
                    template.setSpecificDates(AvailabilityUtil.formatSpecificDates(dto.getSpecificDates()));
                }
                break;
        }

        AvailabilityTemplate savedTemplate = templateRepository.save(template);

        // Regenerate slots
        slotRepository.deleteByDoctorAndGeneratedFromTemplateId(template.getDoctor(), templateId);
        generateSlotsForTemplate(savedTemplate, LocalDate.now(), LocalDate.now().plusDays(30));

        return savedTemplate;
    }

    public void deleteTemplate(Long templateId) {
        AvailabilityTemplate template = templateRepository.findById(templateId)
                .orElseThrow(() -> new EntityNotFoundException("Template not found"));

        // Delete associated slots
        slotRepository.deleteByDoctorAndGeneratedFromTemplateId(template.getDoctor(), templateId);

        templateRepository.delete(template);
    }

    public List<AvailabilityTemplate> getDoctorTemplates(Long doctorId) {
        User doctor = userRepository.findById(doctorId)
                .orElseThrow(() -> new EntityNotFoundException("Doctor not found"));

        return templateRepository.findByDoctorOrderByPriorityDesc(doctor);
    }

    // ============= EXCEPTION MANAGEMENT =============

    public AvailabilityException createException(Long doctorId, AvailabilityExceptionDTO dto) {
        User doctor = userRepository.findById(doctorId)
                .orElseThrow(() -> new EntityNotFoundException("Doctor not found"));

        AvailabilityException exception = new AvailabilityException();
        exception.setDoctor(doctor);
        exception.setExceptionDate(dto.getExceptionDate());
        exception.setExceptionType(dto.getExceptionType());
        exception.setStartTime(dto.getStartTime());
        exception.setEndTime(dto.getEndTime());
        exception.setReason(dto.getReason());

        return exceptionRepository.save(exception);
    }

    public AvailabilityException updateException(Long exceptionId, AvailabilityExceptionDTO dto) {
        AvailabilityException exception = exceptionRepository.findById(exceptionId)
                .orElseThrow(() -> new EntityNotFoundException("Exception not found"));

        exception.setExceptionDate(dto.getExceptionDate());
        exception.setExceptionType(dto.getExceptionType());
        exception.setStartTime(dto.getStartTime());
        exception.setEndTime(dto.getEndTime());
        exception.setReason(dto.getReason());

        return exceptionRepository.save(exception);
    }

    public void deleteException(Long exceptionId) {
        exceptionRepository.deleteById(exceptionId);
    }

    public List<AvailabilityException> getDoctorExceptions(Long doctorId) {
        User doctor = userRepository.findById(doctorId)
                .orElseThrow(() -> new EntityNotFoundException("Doctor not found"));

        return exceptionRepository.findByDoctorOrderByExceptionDateDesc(doctor);
    }

    // ============= SLOT MANAGEMENT =============

    public List<DoctorAvailabilitySlot> getDoctorAvailableSlots(Long doctorId, LocalDate startDate, LocalDate endDate) {
        User doctor = userRepository.findById(doctorId)
                .orElseThrow(() -> new EntityNotFoundException("Doctor not found"));

        return slotRepository.findByDoctorAndSlotDateBetweenOrderBySlotDateAscStartTimeAsc(doctor, startDate, endDate);
    }

    public List<DoctorAvailabilitySlot> getDoctorSlotsForDate(Long doctorId, LocalDate date) {
        User doctor = userRepository.findById(doctorId)
                .orElseThrow(() -> new EntityNotFoundException("Doctor not found"));

        return slotRepository.findByDoctorAndSlotDateOrderByStartTimeAsc(doctor, date);
    }

    public DoctorAvailabilitySlot bookSlot(Long slotId) {
        DoctorAvailabilitySlot slot = slotRepository.findById(slotId)
                .orElseThrow(() -> new EntityNotFoundException("Slot not found"));

        if (slot.getSlotStatus() != DoctorAvailabilitySlot.SlotStatus.AVAILABLE) {
            throw new IllegalStateException("Slot is not available for booking");
        }

        slot.setSlotStatus(DoctorAvailabilitySlot.SlotStatus.BOOKED);
        return slotRepository.save(slot);
    }

    public DoctorAvailabilitySlot releaseSlot(Long slotId) {
        DoctorAvailabilitySlot slot = slotRepository.findById(slotId)
                .orElseThrow(() -> new EntityNotFoundException("Slot not found"));

        slot.setSlotStatus(DoctorAvailabilitySlot.SlotStatus.AVAILABLE);
        return slotRepository.save(slot);
    }

    // ============= SETTINGS MANAGEMENT =============

    public AppointmentSettings getOrCreateSettings(Long doctorId) {
        User doctor = userRepository.findById(doctorId)
                .orElseThrow(() -> new EntityNotFoundException("Doctor not found"));

        return settingsRepository.findByDoctor(doctor)
                .orElseGet(() -> {
                    AppointmentSettings settings = new AppointmentSettings();
                    settings.setDoctor(doctor);
                    settings.setAutoApprove(false);
                    settings.setAllowOverbooking(false);
                    settings.setSlotDurationMinutes(30);
                    settings.setAdvanceBookingDays(30);
                    settings.setBufferTimeMinutes(5);
                    return settingsRepository.save(settings);
                });
    }

    public AppointmentSettings updateSettings(Long doctorId, AppointmentSettingsDTO dto) {
        AppointmentSettings settings = getOrCreateSettings(doctorId);

        settings.setAutoApprove(dto.isAutoApprove());
        settings.setAllowOverbooking(dto.isAllowOverbooking());
        settings.setSlotDurationMinutes(dto.getSlotDurationMinutes());
        settings.setAdvanceBookingDays(dto.getAdvanceBookingDays());
        settings.setBufferTimeMinutes(dto.getBufferTimeMinutes());

        return settingsRepository.save(settings);
    }

    // ============= UTILITY METHODS =============

    private void generateSlotsForTemplate(AvailabilityTemplate template, LocalDate startDate, LocalDate endDate) {
        AppointmentSettings settings = getOrCreateSettings(template.getDoctor().getId());
        int slotDuration = settings.getSlotDurationMinutes();

        LocalDate currentDate = startDate;
        while (!currentDate.isAfter(endDate)) {
            if (isTemplateApplicableForDate(template, currentDate)) {
                // Check for exceptions
                Optional<AvailabilityException> exception = exceptionRepository
                        .findByDoctorAndExceptionDate(template.getDoctor(), currentDate);

                if (exception.isPresent()) {
                    if (exception.get().getExceptionType() == AvailabilityException.ExceptionType.UNAVAILABLE) {
                        currentDate = currentDate.plusDays(1);
                        continue;
                    } else if (exception.get().getExceptionType() == AvailabilityException.ExceptionType.CUSTOM_HOURS) {
                        // Use custom hours from exception
                        generateSlotsForTimeRange(template.getDoctor(), currentDate,
                                exception.get().getStartTime(), exception.get().getEndTime(),
                                slotDuration, template.getId());
                        currentDate = currentDate.plusDays(1);
                        continue;
                    }
                }

                // Generate slots for template's time range
                generateSlotsForTimeRange(template.getDoctor(), currentDate,
                        template.getStartTime(), template.getEndTime(),
                        slotDuration, template.getId());
            }
            currentDate = currentDate.plusDays(1);
        }
    }

    private void generateSlotsForTimeRange(User doctor, LocalDate date, LocalTime startTime,
                                           LocalTime endTime, int slotDuration, Long templateId) {
        LocalTime current = startTime;
        while (current.isBefore(endTime)) {
            LocalTime slotEnd = current.plusMinutes(slotDuration);
            if (slotEnd.isAfter(endTime)) {
                break;
            }

            // Check if slot already exists
            List<DoctorAvailabilitySlot> existingSlots = slotRepository
                    .findConflictingSlots(doctor, date, current, slotEnd);

            if (existingSlots.isEmpty()) {
                DoctorAvailabilitySlot slot = new DoctorAvailabilitySlot();
                slot.setDoctor(doctor);
                slot.setSlotDate(date);
                slot.setStartTime(current);
                slot.setEndTime(slotEnd);
                slot.setSlotStatus(DoctorAvailabilitySlot.SlotStatus.AVAILABLE);
                slot.setGeneratedFromTemplateId(templateId);
                slotRepository.save(slot);
            }

            current = slotEnd;
        }
    }

    private boolean isTemplateApplicableForDate(AvailabilityTemplate template, LocalDate date) {
        switch (template.getScheduleType()) {
            case DAILY:
                return true;
            case WEEKLY:
                Set<Integer> daysOfWeek = AvailabilityUtil.parseDaysOfWeek(template.getDaysOfWeek());
                return AvailabilityUtil.isDateInDaysOfWeek(date, daysOfWeek);
            case SPECIFIC_DATE_RANGE:
                return !date.isBefore(template.getStartDate()) && !date.isAfter(template.getEndDate());
            case SPECIFIC_DATES:
                Set<LocalDate> specificDates = AvailabilityUtil.parseSpecificDates(template.getSpecificDates());
                return specificDates.contains(date);
            default:
                return false;
        }
    }

    // ============= BULK OPERATIONS =============

    public void regenerateAllSlots(Long doctorId) {
        User doctor = userRepository.findById(doctorId)
                .orElseThrow(() -> new EntityNotFoundException("Doctor not found"));

        // Delete all existing slots
        List<DoctorAvailabilitySlot> existingSlots = slotRepository
                .findByDoctorAndSlotDateBetweenOrderBySlotDateAscStartTimeAsc(
                        doctor, LocalDate.now(), LocalDate.now().plusDays(60));

        slotRepository.deleteAll(existingSlots);

        // Regenerate slots from all active templates
        List<AvailabilityTemplate> activeTemplates = templateRepository
                .findByDoctorAndIsActiveOrderByPriorityDesc(doctor, true);

        for (AvailabilityTemplate template : activeTemplates) {
            generateSlotsForTemplate(template, LocalDate.now(), LocalDate.now().plusDays(60));
        }
    }

    // ============= DTO CONVERSION METHODS =============

    public AvailabilityTemplateDTO convertToTemplateDTO(AvailabilityTemplate template) {
        AvailabilityTemplateDTO dto = new AvailabilityTemplateDTO();
        dto.setId(template.getId());
        dto.setTemplateName(template.getTemplateName());
        dto.setScheduleType(template.getScheduleType().name());
        dto.setStartTime(template.getStartTime());
        dto.setEndTime(template.getEndTime());
        dto.setActive(template.isActive());
        dto.setPriority(template.getPriority());

        // Convert schedule-specific fields
        if (template.getDaysOfWeek() != null) {
            dto.setDaysOfWeek(AvailabilityUtil.parseDaysOfWeek(template.getDaysOfWeek()));
        }
        if (template.getSpecificDates() != null) {
            dto.setSpecificDates(AvailabilityUtil.parseSpecificDates(template.getSpecificDates()));
        }
        dto.setStartDate(template.getStartDate());
        dto.setEndDate(template.getEndDate());

        return dto;
    }

    public AvailabilityExceptionDTO convertToExceptionDTO(AvailabilityException exception) {
        AvailabilityExceptionDTO dto = new AvailabilityExceptionDTO();
        dto.setId(exception.getId());
        dto.setExceptionDate(exception.getExceptionDate());
        dto.setExceptionType(exception.getExceptionType());
        dto.setStartTime(exception.getStartTime());
        dto.setEndTime(exception.getEndTime());
        dto.setReason(exception.getReason());
        return dto;
    }

    public DoctorAvailabilitySlotDTO convertToSlotDTO(DoctorAvailabilitySlot slot) {
        DoctorAvailabilitySlotDTO dto = new DoctorAvailabilitySlotDTO();
        dto.setId(slot.getId());
        dto.setSlotDate(slot.getSlotDate());
        dto.setStartTime(slot.getStartTime());
        dto.setEndTime(slot.getEndTime());
        dto.setSlotStatus(slot.getSlotStatus());
        dto.setGeneratedFromTemplateId(slot.getGeneratedFromTemplateId());
        return dto;
    }

    public AppointmentSettingsDTO convertToSettingsDTO(AppointmentSettings settings) {
        AppointmentSettingsDTO dto = new AppointmentSettingsDTO();
        dto.setId(settings.getId());
        dto.setAutoApprove(settings.isAutoApprove());
        dto.setAllowOverbooking(settings.isAllowOverbooking());
        dto.setSlotDurationMinutes(settings.getSlotDurationMinutes());
        dto.setAdvanceBookingDays(settings.getAdvanceBookingDays());
        dto.setBufferTimeMinutes(settings.getBufferTimeMinutes());
        return dto;
    }
}