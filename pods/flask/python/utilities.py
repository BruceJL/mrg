"""Some useful functions used by several things"""

import re, datetime


def optionalFieldIsGood(mine, theirs):
    """check if optional field theirs matches with mine"""
    if (theirs is None or
            theirs == "" or
            theirs == mine):
        return True
    else:
        return False


def requiredFieldIsGood(mine, theirs):
    """check if required field theirs matches with mine"""
    if (theirs is not None and
            mine == theirs):
        return True
    else:
        return False


def sanitize(string):
    """Returns string with unsanitary characters (";) removed"""
    return string.translate(None, '";')


def validateName(name):
    """Returns False if name looks potentially incorrect"""
    if name.count(' ') > 1:
        return False
    # if has > 2 caps or 0 caps
    if sum(1 for c in name if c.isupper()) > 2 or sum(1 for c in name if c.isupper()) == 0:
        return False
    # if has more than 1 of ' or -
    if name.count('\'') > 1:
        return False
    if name.count('-') > 1:
        return False
    # if has any chars other than A-Z ' -
    if re.match('[A-Za-z\'-]*', name) == None:
        return False

    return True


def stripPhoneNumber(number):
    """Returns number stripped of any characters other than 0-9, +, and x"""
    newNumber = ''
    for c in number:
        if c.isdigit() or c == '+' or c == 'x':
            newNumber += c

    return newNumber


def validEmail(email):
    """Returns False if email isn't in valid format"""
    # match = re.match("^\\w+@[a-zA-Z_]+?\\.[a-zA-Z]{2,3}$", email)
    match = re.match(
        r"[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?",
        email)
    return match != None


def stripPostal(postal):
    """Returns postal code string stripped of any characters other than A-Z, 0-9"""
    newPostal = ''
    for c in postal.upper():
        if c.isalnum():
            newPostal += c

    return newPostal


def convertTimeToSeconds(timeString):
    """convert MM:SS to seconds"""
    tokens = timeString.split(':')
    return int(tokens[0]) * 60 + int(tokens[1])


def convertStringToTimedelta(timeString):
    """convert 'M:SS' to timedelta"""
    tokens = timeString.split(':')
    minutes = int(tokens[0])
    seconds = int(tokens[1])
    return datetime.timedelta(minutes=minutes, seconds=seconds)


def humanPostalCodeFormat(postalString):
    """tries to add a space after 3 characters and returns the string"""
    result = postalString
    if len(postalString) > 3:
        result = postalString[0:3] + " " + postalString[3:]
    return result


def humanPhoneNumberFormat(phoneString):
    """tries to add "-" to phoneString, returns result"""
    result = phoneString
    extString = ""
    fourDigit = ""
    threeDigit = []
    if 'x' in phoneString:
        extString = phoneString[phoneString.index('x')+1:]
        result = phoneString[0:phoneString.index('x')-1]

    if len(result) > 4:
        fourDigit = result[-4:]
        result = result[0:-4]

    for i in range(len(result), 0, -3):
        threeDigit.append(result[i-3:i])
        result = result[0:i-3]

    # Now put it all back together
    if result != "":
        result += "-"

    for i in range(len(threeDigit)-1, -1, -1):
        result += (threeDigit[i] + "-")

    if fourDigit != "":
        result += (fourDigit)

    if extString != "":
        result += (" ext. " + extString)

    return result
