package com.wms.wms_lite.domain.user.member.exception;

import com.wms.wms_lite.global.error.BusinessException;

public class MemberException extends BusinessException { public MemberException(MemberErrorCode errorCode){ super(errorCode); } }
