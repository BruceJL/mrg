#!/usr/bin/python

import smtplib
import csv

def prompt(prompt):
    return raw_input(prompt).strip()

def send_email(toaddr, message, subject="",cc="",bcc=""):
    """Send the actual email"""

    username = "webster@mbrobotgames.ca"
    password = "qLXIBC9T8B"

    fromaddr = "noreply@mbrobotgames.ca"

    message = "Subject:{subject}\n\n{message}".format(
        subject=subject,
        message=message,
        sender=fromaddr,
        to=toaddr,
        cc=cc)

    try:
        toaddr = toaddr+","+cc+","+bcc
        print "Sending email to",toaddr

        server = smtplib.SMTP('mail.swd.ca:587')
        server.starttls() # depends on server encryption
        server.login(username,password)
        server.sendmail(fromaddr, toaddr, message)
        server.quit()
    except Exception as e:
        print "Error sending message",e

lines = []

with open('2015_Registration_Test4.csv', 'rb') as csvfile:
    csvReader = csv.reader(csvfile, delimiter=',', quotechar='"')
    for row in csvReader:
        lines.insert(len(lines),row)

# ditch the header row
lines.pop(0)

for i in range(len(lines)-1,0,-1):
    if len(lines[i]) == 0:
        lines.remove(lines[i])

for l in lines:
    (robot,competition,driver1,firstGr,driver2,secondGr,driver3,thirdGr,school,coach,email,phone,streetAddr,addr2,city,province,postalCode,country,comments,createdBy,entryId,entryDate,sourceURL,transactionId,paymentAmt,paymentDate,paymentStatus,postId,userAgent,userIP) = l
    token=int(entryId)*64305+1107

    message = """
This is an automated email. If you encounter problems please contact ian@mbrobotgames.ca with the subject "ConfirmError".

Hello {coach},

Thanks for pre-registering for the Manitoba Robot Games. Your information is as follows:

Robot: {robot}
Competition: {competition}
Driver(s): {driver1}, {driver2}, {driver3}
School: {school}
Coach: {coach}

Please follow this link to confirm, edit or cancel you registration.

 http://mbrobotgames.ca/mrgwp/confirm/?token={token}

If you Confirm your entry, with or without changes, you will be transferred to a Confirmation Sheet page.

Please print that page and bring it to the registration desk on Saturday as proof that you confirmed and are eligible for the $5.00 entry fee.

Please Confirm or Cancel as soon as possible but no later than Thursday at 9:00AM.

Thanks for helping us improve the games!

-Manitoba Robot Games

""".format(
    coach=coach,
    robot=robot,
    competition=competition,
    driver1=driver1,
    driver2=driver2,
    driver3=driver3,
    school=school,
    token=token)

    subject = "Manitoba Robot Games Confirmation for robot {robot}".format(robot=robot)
    print "email is "+email
    print "subject is "+subject
    print message
    # send_email("umcarr77@gmail.com",message,subject)
