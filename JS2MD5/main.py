# -*- coding:utf-8 -*-
import io
import hashlib
import os
import re

fileDict = {}

# 替换Files.js中文件内容
def fileReplace(key, file):
    w_str = ''
    for line in file:
        if re.search(key, line):
            line = re.sub(key, fileDict[key], line)
            w_str += line
        else:
            w_str += line
    return w_str


def createTxt(txt):
    file = open(os.getcwd() + r'/read.txt', 'a')
    file.write(txt + '\n')
    file.close()


def md5(str):
    m = hashlib.md5()
    m.update(str)
    psw = m.hexdigest()
    return psw


def splitJS(rootPath, fileName):
    headName = fileName.split('.js')[0]
    md5Name = md5(headName)
    newPath = rootPath.split(fileName)[0]
    md5Name = md5Name + '.js'
    fileDict[fileName] = md5Name

    # print '\t'
    # print '原文件名字 = ' + fileName
    # print '原文件没有 = ' + headName
    # print '原文件路径 = ' + rootPath
    # print '修改以后的 = ' + md5Name + ".js"

    createTxt(headName + ' ------------  ' + md5Name)
    os.rename(rootPath, os.path.join(newPath, md5Name + '.js'))


def getFilesList(path):
    files = os.listdir(path)
    for fileName in files:
        file_dir = os.path.join(path, fileName)
        if os.path.isdir(file_dir):
            getFilesList(file_dir)
        else:
            splitJS(file_dir, fileName)


def main():
    file = open(os.getcwd() + r'/read.txt', 'a')
    file.truncate()

    createTxt('原文件     修改后的文件')
    print '获取当前路径下的文件列表'
    getFilesList(os.getcwd() + r'/src')
    
    text = ''
    for key in fileDict:
        if key == 'files.js':
            oldFile = os.path.join(os.getcwd(), 'src' + '\\' + fileDict[key])
            file = io.open(oldFile, 'r', encoding='UTF-8')
            text = fileReplace(key, file)

            wopen = open(oldFile, 'w')
            wopen.write(text)
            file.close()
            wopen.close()
        
  
    print '文件名称修改完成'


main()
